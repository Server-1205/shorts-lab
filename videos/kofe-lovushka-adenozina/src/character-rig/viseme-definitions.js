/**
 * Standard Viseme and Facial Expression Definitions for HyperFrames Character Rig
 * Supports both Browser (window.VisemeDefinitions) and Node.js environments.
 */

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else if (typeof define === 'function' && define.amd) {
    define(factory);
  } else {
    root.VisemeDefinitions = factory();
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const MOUTH_SHAPES = {
    // 1. Rest: Neutral closed line, relaxed
    'rest': {
      d: 'M 175 255 Q 200 252 225 255 Q 200 256 175 255 Z',
      fill: '#881337',
      stroke: '#4C0519',
      strokeWidth: 4,
      scaleX: 1.0,
      scaleY: 1.0
    },

    // 2. A: Open jaw, tall rounded aperture ("ah", "aa", "а", "я")
    'A': {
      d: 'M 172 245 Q 200 238 228 245 Q 200 286 172 245 Z',
      fill: '#FFE4E6',
      stroke: '#881337',
      strokeWidth: 4,
      scaleX: 1.0,
      scaleY: 1.0
    },

    // 3. O: Rounded pursed oval ("oh", "ou", "о", "ё")
    'O': {
      d: 'M 184 242 Q 200 236 216 242 Q 226 256 216 272 Q 200 276 184 272 Q 174 256 184 242 Z',
      fill: '#881337',
      stroke: '#4C0519',
      strokeWidth: 4,
      scaleX: 1.0,
      scaleY: 1.0
    },

    // 4. E: Stretched wide horizontal teeth grin ("ee", "eh", "е", "э", "и", "ы")
    'E': {
      d: 'M 165 248 Q 200 242 235 248 Q 200 264 165 248 Z',
      fill: '#FFFFFF',
      stroke: '#881337',
      strokeWidth: 4,
      scaleX: 1.05,
      scaleY: 1.0
    },

    // 5. U: Small puckered circular opening ("oo", "u", "у", "ю")
    'U': {
      d: 'M 190 250 Q 200 246 210 250 Q 216 258 210 266 Q 200 270 190 266 Q 184 258 190 250 Z',
      fill: '#881337',
      stroke: '#4C0519',
      strokeWidth: 4,
      scaleX: 0.9,
      scaleY: 0.95
    },

    // 6. Smile: Cheerful closed or slight curve smile
    'smile': {
      d: 'M 168 248 Q 200 272 232 248 Q 200 254 168 248 Z',
      fill: '#FFE4E6',
      stroke: '#881337',
      strokeWidth: 4,
      scaleX: 1.0,
      scaleY: 1.0
    },

    // 7. Open-laugh: Big beaming open crescent laughing mouth
    'open-laugh': {
      d: 'M 160 240 Q 200 295 240 240 Q 200 248 160 240 Z',
      fill: '#FFE4E6',
      stroke: '#881337',
      strokeWidth: 4,
      scaleX: 1.05,
      scaleY: 1.05
    },

    // 8. Scared: Nervous wobbly squiggly mouth
    'scared': {
      d: 'M 175 260 Q 188 252 200 262 Q 212 254 225 260 Q 200 263 175 260 Z',
      fill: '#881337',
      stroke: '#4C0519',
      strokeWidth: 4,
      scaleX: 0.95,
      scaleY: 0.95
    }
  };

  const BROW_SHAPES = {
    'neutral': {
      left: { d: 'M 140 180 Q 165 170 185 180', rotation: 0, y: 0 },
      right: { d: 'M 215 180 Q 235 170 260 180', rotation: 0, y: 0 }
    },
    'happy': {
      left: { d: 'M 140 172 Q 165 158 185 172', rotation: -5, y: -4 },
      right: { d: 'M 215 172 Q 235 158 260 172', rotation: 5, y: -4 }
    },
    'scared': {
      left: { d: 'M 140 165 Q 165 185 185 175', rotation: 8, y: 3 },
      right: { d: 'M 215 175 Q 235 185 260 165', rotation: -8, y: 3 }
    },
    'eureka': {
      left: { d: 'M 140 170 Q 165 160 185 175', rotation: -4, y: -6 },
      right: { d: 'M 215 175 Q 235 160 260 170', rotation: 4, y: -6 }
    },
    'surprised': {
      left: { d: 'M 140 160 Q 165 148 185 160', rotation: 0, y: -10 },
      right: { d: 'M 215 160 Q 235 148 260 160', rotation: 0, y: -10 }
    }
  };

  const EYE_STATES = {
    'normal': {
      scaleY: 1.0,
      scaleX: 1.0,
      pupilRadius: 13,
      pupilDx: 0,
      pupilDy: 0
    },
    'blink': {
      scaleY: 0.05,
      scaleX: 1.0,
      pupilRadius: 13,
      pupilDx: 0,
      pupilDy: 0
    },
    'look-left': {
      scaleY: 1.0,
      scaleX: 1.0,
      pupilRadius: 13,
      pupilDx: -9,
      pupilDy: 0
    },
    'look-right': {
      scaleY: 1.0,
      scaleX: 1.0,
      pupilRadius: 13,
      pupilDx: 9,
      pupilDy: 0
    },
    'look-center': {
      scaleY: 1.0,
      scaleX: 1.0,
      pupilRadius: 13,
      pupilDx: 0,
      pupilDy: 0
    },
    'wink': {
      scaleY: 0.08,
      scaleX: 1.0,
      pupilRadius: 13,
      pupilDx: 0,
      pupilDy: 0
    },
    'shock': {
      scaleY: 1.15,
      scaleX: 1.15,
      pupilRadius: 5, // pinpoint panic pupils
      pupilDx: 0,
      pupilDy: 0
    }
  };

  const EMOTION_PRESETS = {
    'idle': {
      mouth: 'rest',
      brows: 'neutral',
      eyes: 'normal',
      blush: 0,
      glasses: { y: 0, rotation: 0 },
      arms: { leftRotation: 0, rightRotation: 0, y: 0 },
      bodyScaleY: 1.0,
      propLightbulb: false
    },
    'happy': {
      mouth: 'smile',
      brows: 'happy',
      eyes: 'normal',
      blush: 0.85,
      glasses: { y: 0, rotation: 0 },
      arms: { leftRotation: -20, rightRotation: 20, y: -5 },
      bodyScaleY: 1.04,
      propLightbulb: false
    },
    'scared': {
      mouth: 'scared',
      brows: 'scared',
      eyes: 'shock',
      blush: 0,
      glasses: { y: 22, rotation: 8 },
      arms: { leftRotation: -35, rightRotation: 35, y: -8 },
      bodyScaleY: 0.94,
      propLightbulb: false
    },
    'eureka': {
      mouth: 'smile',
      brows: 'eureka',
      eyes: 'normal',
      blush: 0.8,
      glasses: { y: 0, rotation: 0 },
      arms: { leftRotation: 15, rightRotation: -85, y: -25 }, // right arm points up!
      bodyScaleY: 1.06,
      propLightbulb: true
    },
    'triumph': {
      mouth: 'open-laugh',
      brows: 'happy',
      eyes: 'normal',
      blush: 0.9,
      glasses: { y: 0, rotation: 0 },
      arms: { leftRotation: -75, rightRotation: 75, y: -35 }, // both arms up!
      bodyScaleY: 1.08,
      propLightbulb: false
    },
    'talking': {
      mouth: 'A',
      brows: 'neutral',
      eyes: 'normal',
      blush: 0.4,
      glasses: { y: 0, rotation: 0 },
      arms: { leftRotation: -12, rightRotation: 12, y: -2 },
      bodyScaleY: 1.0,
      propLightbulb: false
    }
  };

  return {
    MOUTH_SHAPES,
    BROW_SHAPES,
    EYE_STATES,
    EMOTION_PRESETS
  };
});
