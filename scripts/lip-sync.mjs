#!/usr/bin/env node

/**
 * HyperFrames Automated Lip-Sync & Viseme Generator
 *
 * Converts text, subtitle files (VTT/SRT), or timestamped transcript JSON
 * into synchronized mouth shapes (visemes) for character rigs.
 *
 * Standard Visemes:
 *  - rest: closed neutral mouth (silence, bilabial m/b/p)
 *  - A:    wide open jaw ("ah", "aa", "а", "я")
 *  - O:    rounded oval lips ("oh", "ou", "о", "ё")
 *  - E:    stretched horizontal grin with visible teeth ("ee", "eh", "е", "э", "и", "ы")
 *  - U:    small pursed puckered mouth ("oo", "u", "у", "ю")
 *  - smile: closed or slightly parted cheerful smile
 *  - open-laugh: big ecstatic open laugh / shouting
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

/**
 * Phoneme / Character to Viseme classification
 */
const VOWEL_VISEME_MAP = {
  // Russian vowels
  'а': 'A', 'я': 'A',
  'о': 'O', 'ё': 'O',
  'е': 'E', 'э': 'E', 'и': 'E', 'ы': 'E',
  'у': 'U', 'ю': 'U',

  // English vowels & diphthongs
  'a': 'A',
  'o': 'O',
  'e': 'E', 'i': 'E', 'y': 'E',
  'u': 'U', 'w': 'U'
};

const BILABIAL_CONSONANTS = new Set([
  // Russian bilabials (lips closed)
  'б', 'п', 'м',
  // English bilabials
  'b', 'p', 'm'
]);

const DENTAL_LABIAL_CONSONANTS = new Set([
  'в', 'ф', 'v', 'f'
]);

const SIBILANT_DENTAL_CONSONANTS = new Set([
  'с', 'з', 'ц', 'ч', 'ш', 'щ', 'т', 'д', 'н', 'л', 'р', 'ж',
  's', 'z', 't', 'd', 'n', 'l', 'r', 'c', 'j'
]);

/**
 * Map a character / phoneme to its primary viseme
 */
export function charToViseme(char) {
  if (!char) return 'rest';
  const c = char.toLowerCase();
  if (VOWEL_VISEME_MAP[c]) {
    return VOWEL_VISEME_MAP[c];
  }
  if (BILABIAL_CONSONANTS.has(c)) {
    return 'rest';
  }
  if (DENTAL_LABIAL_CONSONANTS.has(c) || SIBILANT_DENTAL_CONSONANTS.has(c)) {
    return 'E';
  }
  return 'rest';
}

/**
 * Break a word into phonetic syllables / phoneme clusters
 */
export function syllabify(word) {
  const clean = word.toLowerCase().replace(/[^a-zа-яё]/gi, '');
  if (!clean) return [];

  const syllables = [];
  let current = '';

  for (let i = 0; i < clean.length; i++) {
    const char = clean[i];
    current += char;
    const isVowel = Boolean(VOWEL_VISEME_MAP[char]);
    const nextChar = clean[i + 1];
    const nextIsVowel = nextChar ? Boolean(VOWEL_VISEME_MAP[nextChar]) : false;

    // Split after vowel if next consonant is followed by another vowel or at word boundary
    if (isVowel) {
      if (nextChar && !nextIsVowel && i + 2 < clean.length && VOWEL_VISEME_MAP[clean[i + 2]]) {
        syllables.push(current);
        current = '';
      } else if (nextChar && nextIsVowel) {
        syllables.push(current);
        current = '';
      }
    }
  }

  if (current) {
    if (syllables.length > 0 && !/[a-zа-яё]*[aeiouyаеёиоуыэюя]/i.test(current)) {
      syllables[syllables.length - 1] += current;
    } else {
      syllables.push(current);
    }
  }

  return syllables.length > 0 ? syllables : [clean];
}

/**
 * Generate mouth shapes for a single word within given [startTime, endTime]
 */
export function wordToVisemes(word, startTime, endTime, options = {}) {
  const minVisemeDuration = options.minVisemeDuration ?? 0.08;
  const wordDuration = Math.max(0.12, endTime - startTime);
  const syllables = syllabify(word);

  if (syllables.length === 0) {
    return [{ time: startTime, mouth: 'rest', duration: wordDuration }];
  }

  const syllableDuration = wordDuration / syllables.length;
  const visemes = [];

  for (let i = 0; i < syllables.length; i++) {
    const syl = syllables[i];
    const sylStart = startTime + i * syllableDuration;

    // Find main vowel in syllable
    let dominantViseme = 'E';
    let hasBilabial = false;

    for (const ch of syl) {
      if (VOWEL_VISEME_MAP[ch]) {
        dominantViseme = VOWEL_VISEME_MAP[ch];
        break;
      }
      if (BILABIAL_CONSONANTS.has(ch)) {
        hasBilabial = true;
      }
    }

    if (hasBilabial && syllableDuration > 0.16) {
      // Bilabial closure onset followed by vowel peak
      const closureDur = Math.min(0.06, syllableDuration * 0.3);
      visemes.push({
        time: Number(sylStart.toFixed(3)),
        mouth: 'rest',
        duration: Number(closureDur.toFixed(3))
      });
      visemes.push({
        time: Number((sylStart + closureDur).toFixed(3)),
        mouth: dominantViseme,
        duration: Number((syllableDuration - closureDur).toFixed(3))
      });
    } else {
      visemes.push({
        time: Number(sylStart.toFixed(3)),
        mouth: dominantViseme,
        duration: Number(syllableDuration.toFixed(3))
      });
    }
  }

  return visemes;
}

/**
 * Smooth and coarticulate visemes to eliminate jitter and micro-flashes
 */
export function optimizeVisemes(keyframes, minDuration = 0.06) {
  if (!keyframes || keyframes.length === 0) return [];

  const merged = [];
  for (const kf of keyframes) {
    if (merged.length === 0) {
      merged.push({ ...kf });
      continue;
    }
    const prev = merged[merged.length - 1];
    if (prev.mouth === kf.mouth) {
      // Extend duration
      prev.duration = Number((kf.time + kf.duration - prev.time).toFixed(3));
    } else if (kf.time < prev.time + prev.duration) {
      // Clamp overlap
      prev.duration = Number((kf.time - prev.time).toFixed(3));
      merged.push({ ...kf });
    } else {
      if (kf.time > prev.time + prev.duration + 0.02) {
        // Gap -> insert rest
        merged.push({
          time: Number((prev.time + prev.duration).toFixed(3)),
          mouth: 'rest',
          duration: Number((kf.time - (prev.time + prev.duration)).toFixed(3))
        });
      }
      merged.push({ ...kf });
    }
  }

  return merged.filter(k => k.duration >= minDuration || k.mouth === 'rest');
}

/**
 * Convert plain text string with start time and duration to visemes
 */
export function textToVisemes(text, options = {}) {
  const startTime = options.startTime ?? 0;
  const duration = options.duration ?? 4.0;
  const words = text.trim().split(/\s+/).filter(Boolean);

  if (words.length === 0) {
    return [{ time: startTime, mouth: 'rest', duration }];
  }

  // Weight words by length and syllable count
  const wordWeights = words.map(w => Math.max(1, syllabify(w).length));
  const totalWeight = wordWeights.reduce((a, b) => a + b, 0);

  // Leave small pauses for punctuation
  const usableDuration = duration * 0.92;
  const baseUnitTime = usableDuration / totalWeight;

  const rawKeyframes = [];
  let currentTime = startTime;

  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    const wDur = Math.max(0.14, wordWeights[i] * baseUnitTime);
    const wKeyframes = wordToVisemes(word, currentTime, currentTime + wDur, options);
    rawKeyframes.push(...wKeyframes);

    currentTime += wDur;

    // Check punctuation for pause
    const lastChar = word[word.length - 1];
    if ([',', ';', '-', '—'].includes(lastChar)) {
      rawKeyframes.push({
        time: Number(currentTime.toFixed(3)),
        mouth: 'rest',
        duration: 0.12
      });
      currentTime += 0.12;
    } else if (['.', '!', '?', ':'].includes(lastChar)) {
      rawKeyframes.push({
        time: Number(currentTime.toFixed(3)),
        mouth: 'rest',
        duration: 0.22
      });
      currentTime += 0.22;
    }
  }

  // Final rest at the end
  rawKeyframes.push({
    time: Number(currentTime.toFixed(3)),
    mouth: 'rest',
    duration: 0.2
  });

  return optimizeVisemes(rawKeyframes);
}

/**
 * Parse WebVTT content to visemes
 */
export function parseVttToVisemes(vttContent, options = {}) {
  const timeRegex = /(\d{2}:)?(\d{2}):(\d{2})[.,](\d{3})\s*-->\s*(\d{2}:)?(\d{2}):(\d{2})[.,](\d{3})/;
  const lines = vttContent.split(/\r?\n/);
  const cues = [];

  let currentCue = null;

  function toSeconds(h, m, s, ms) {
    const hours = h ? parseInt(h.replace(':', ''), 10) : 0;
    const minutes = parseInt(m, 10);
    const seconds = parseInt(s, 10);
    const millis = parseInt(ms, 10);
    return hours * 3600 + minutes * 60 + seconds + millis / 1000;
  }

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed === 'WEBVTT' || /^\d+$/.test(trimmed)) continue;

    const match = trimmed.match(timeRegex);
    if (match) {
      if (currentCue) cues.push(currentCue);
      const start = toSeconds(match[1], match[2], match[3], match[4]);
      const end = toSeconds(match[5], match[6], match[7], match[8]);
      currentCue = { start, end, text: '' };
    } else if (currentCue) {
      currentCue.text += (currentCue.text ? ' ' : '') + trimmed;
    }
  }

  if (currentCue) cues.push(currentCue);

  const allVisemes = [];
  for (const cue of cues) {
    const visemes = textToVisemes(cue.text, {
      startTime: cue.start,
      duration: cue.end - cue.start,
      ...options
    });
    allVisemes.push(...visemes);
  }

  return optimizeVisemes(allVisemes);
}

/**
 * Parse transcript JSON (array of { word, start, end } or { text, start, end })
 */
export function parseTranscriptToVisemes(transcriptData, options = {}) {
  const items = Array.isArray(transcriptData) ? transcriptData : (transcriptData.words || transcriptData.segments || []);
  const allVisemes = [];

  for (const item of items) {
    if (item.word && typeof item.start === 'number' && typeof item.end === 'number') {
      const v = wordToVisemes(item.word, item.start, item.end, options);
      allVisemes.push(...v);
    } else if (item.text && typeof item.start === 'number' && typeof item.end === 'number') {
      const v = textToVisemes(item.text, {
        startTime: item.start,
        duration: item.end - item.start,
        ...options
      });
      allVisemes.push(...v);
    }
  }

  return optimizeVisemes(allVisemes);
}

// CLI handler when run directly
if (process.argv[1] && process.argv[1].endsWith('lip-sync.mjs')) {
  const args = process.argv.slice(2);

  if (args.includes('--help') || args.includes('-h') || args.length === 0) {
    console.log(`
HyperFrames Lip-Sync CLI Utility
Usage:
  node scripts/lip-sync.mjs --text "Hello world" --start 0.5 --duration 3.0 [--output visemes.json]
  node scripts/lip-sync.mjs --vtt subtitles.vtt [--output visemes.json]
  node scripts/lip-sync.mjs --json transcript.json [--output visemes.json]
  node scripts/lip-sync.mjs test
    `);
    process.exit(0);
  }

  if (args[0] === 'test') {
    console.log('Running Lip-Sync unit verification...');
    const sample = textToVisemes('Знакомо? Надо делать важное дело!', { startTime: 0.1, duration: 2.5 });
    console.log(`Generated ${sample.length} viseme keyframes:`);
    console.log(JSON.stringify(sample.slice(0, 8), null, 2));
    const validShapes = new Set(['rest', 'A', 'O', 'E', 'U', 'smile', 'open-laugh']);
    const allValid = sample.every(k => validShapes.has(k.mouth) && k.duration > 0 && k.time >= 0);
    if (allValid) {
      console.log('✓ All viseme keyframes passed validation!');
      process.exit(0);
    } else {
      console.error('✗ Validation failed on sample keyframes');
      process.exit(1);
    }
  }

  const getArg = (flag) => {
    const idx = args.indexOf(flag);
    return idx !== -1 && idx + 1 < args.length ? args[idx + 1] : null;
  };

  const text = getArg('--text');
  const start = parseFloat(getArg('--start') ?? '0');
  const duration = parseFloat(getArg('--duration') ?? '3.0');
  const vttPath = getArg('--vtt');
  const jsonPath = getArg('--json');
  const outPath = getArg('--output');

  let result = [];

  if (vttPath) {
    const content = readFileSync(resolve(vttPath), 'utf-8');
    result = parseVttToVisemes(content);
  } else if (jsonPath) {
    const content = JSON.parse(readFileSync(resolve(jsonPath), 'utf-8'));
    result = parseTranscriptToVisemes(content);
  } else if (text) {
    result = textToVisemes(text, { startTime: start, duration });
  }

  const jsonStr = JSON.stringify(result, null, 2);
  if (outPath) {
    writeFileSync(resolve(outPath), jsonStr, 'utf-8');
    console.log(`Visemes successfully written to ${outPath} (${result.length} keyframes).`);
  } else {
    console.log(jsonStr);
  }
}
