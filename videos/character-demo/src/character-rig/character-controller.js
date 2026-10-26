/**
 * Modular 2D Character Rig Controller for HyperFrames
 * High-level JS API to animate expressions, emotions, visemes, and poses cleanly
 * without manually writing dozens of SVG coordinates.
 */

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    const definitions = require('./viseme-definitions.js');
    const svgGen = require('./character-svg.js');
    module.exports = factory(definitions, svgGen);
  } else if (typeof define === 'function' && define.amd) {
    define(['./viseme-definitions.js', './character-svg.js'], factory);
  } else {
    root.CharacterRig = factory(root.VisemeDefinitions, root.CharacterSvg);
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function (VisemeDefs, SvgGen) {
  'use strict';

  const MOUTH_SHAPES = (VisemeDefs && VisemeDefs.MOUTH_SHAPES) || {};
  const BROW_SHAPES = (VisemeDefs && VisemeDefs.BROW_SHAPES) || {};
  const EYE_STATES = (VisemeDefs && VisemeDefs.EYE_STATES) || {};

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
      arms: { leftRotation: 15, rightRotation: -15, y: -4 },
      bodyScaleY: 1.04,
      propLightbulb: false
    },
    'scared': {
      mouth: 'scared',
      brows: 'scared',
      eyes: 'shock',
      blush: 0,
      glasses: { y: 22, rotation: 8 },
      arms: { leftRotation: 40, rightRotation: -40, y: -6 }, // arms hug sides in fright
      bodyScaleY: 0.94,
      propLightbulb: false
    },
    'eureka': {
      mouth: 'smile',
      brows: 'eureka',
      eyes: 'normal',
      blush: 0.8,
      glasses: { y: 0, rotation: 0 },
      arms: { leftRotation: 10, rightRotation: 80, y: -20 }, // right arm raises high pointing up!
      bodyScaleY: 1.06,
      propLightbulb: true
    },
    'triumph': {
      mouth: 'open-laugh',
      brows: 'happy',
      eyes: 'normal',
      blush: 0.9,
      glasses: { y: 0, rotation: 0 },
      arms: { leftRotation: -80, rightRotation: 80, y: -28 }, // both arms raised high in victory!
      bodyScaleY: 1.08,
      propLightbulb: false
    },
    'talking': {
      mouth: 'A',
      brows: 'neutral',
      eyes: 'normal',
      blush: 0.5,
      glasses: { y: 0, rotation: 0 },
      arms: { leftRotation: 15, rightRotation: -15, y: -2 },
      bodyScaleY: 1.0,
      propLightbulb: false
    }
  };

  class CharacterRig {
    /**
     * @param {Object} options
     * @param {string} [options.id='brainy'] Prefix ID for SVG elements
     * @param {string|Element} [options.container] Parent DOM container to mount into
     * @param {boolean} [options.autoRender=true] Automatically inject SVG into container
     * @param {number} [options.width=400]
     * @param {number} [options.height=400]
     */
    constructor(options = {}) {
      this.id = options.id || 'brainy';
      this.container = typeof options.container === 'string'
        ? (typeof document !== 'undefined' ? document.querySelector(options.container) : null)
        : (options.container || null);

      this.currentEmotion = 'idle';
      this.currentMouth = 'rest';
      this.currentEyeState = 'normal';
      this.currentPose = 'idle';

      if (options.autoRender !== false && this.container && SvgGen && SvgGen.renderCharacterSvg) {
        this.mount(this.container, options);
      }
    }

    /**
     * Mount character SVG into target container
     */
    mount(containerEl, renderOptions = {}) {
      if (!containerEl) return;
      this.container = containerEl;
      if (SvgGen && SvgGen.renderCharacterSvg) {
        this.container.innerHTML = SvgGen.renderCharacterSvg({
          id: this.id,
          ...renderOptions
        });
      }

      // Initialize default transform anchors
      if (typeof gsap !== 'undefined') {
        gsap.set(this.sel('root'), { transformOrigin: '50% 100%' });
        gsap.set(this.sel('torso'), { transformOrigin: '50% 80%' });
        gsap.set(this.sel('arm-left'), { transformOrigin: '100% 0%' });
        gsap.set(this.sel('arm-right'), { transformOrigin: '0% 0%' });
        gsap.set(this.sel('eye-left'), { transformOrigin: '50% 50%' });
        gsap.set(this.sel('eye-right'), { transformOrigin: '50% 50%' });
        gsap.set(this.sel('glasses'), { transformOrigin: '50% 50%' });
        gsap.set(this.sel('prop-lightbulb'), { transformOrigin: '50% 100%', scale: 0, opacity: 0 });
      }
    }

    /**
     * Helper to get element selector string
     */
    sel(part) {
      return `#${this.id}-${part}`;
    }

    /**
     * Set character emotion preset on a GSAP timeline
     * @param {gsap.core.Timeline} tl Target timeline
     * @param {'idle'|'happy'|'scared'|'eureka'|'triumph'|'talking'} emotion
     * @param {number} atTime Timeline insertion time (seconds)
     * @param {Object} [opts] Options
     */
    setEmotion(tl, emotion, atTime, opts = {}) {
      const preset = EMOTION_PRESETS[emotion] || EMOTION_PRESETS['idle'];
      const duration = opts.duration ?? 0.35;
      const ease = opts.ease ?? 'power2.out';

      this.currentEmotion = emotion;

      // 1. Mouth transition
      if (preset.mouth) {
        this.setMouth(tl, preset.mouth, atTime, { duration, ease });
      }

      // 2. Eyebrow shape and rotation
      const browData = BROW_SHAPES[preset.brows] || BROW_SHAPES['neutral'];
      if (browData) {
        tl.to(this.sel('brow-left'), {
          attr: { d: browData.left.d },
          rotation: browData.left.rotation,
          y: browData.left.y,
          duration,
          ease
        }, atTime);

        tl.to(this.sel('brow-right'), {
          attr: { d: browData.right.d },
          rotation: browData.right.rotation,
          y: browData.right.y,
          duration,
          ease
        }, atTime);
      }

      // 3. Eye state (normal / shock / blink)
      if (preset.eyes) {
        this.setEyeState(tl, preset.eyes, atTime, { duration, ease });
      }

      // 4. Glasses position
      if (preset.glasses) {
        tl.to(this.sel('glasses'), {
          y: preset.glasses.y,
          rotation: preset.glasses.rotation,
          duration: emotion === 'scared' ? duration * 1.2 : duration * 0.8,
          ease: emotion === 'eureka' ? 'back.out(2)' : ease
        }, atTime);
      }

      // 5. Cheeks / Blush
      if (typeof preset.blush === 'number') {
        tl.to([this.sel('blush-left'), this.sel('blush-right')], {
          opacity: preset.blush,
          duration: duration * 1.2,
          ease
        }, atTime);
      }

      // 6. Arm Poses
      if (preset.arms) {
        tl.to(this.sel('arm-left'), {
          rotation: preset.arms.leftRotation,
          y: preset.arms.y,
          duration,
          ease: emotion === 'eureka' || emotion === 'triumph' ? 'back.out(1.6)' : ease
        }, atTime);

        tl.to(this.sel('arm-right'), {
          rotation: preset.arms.rightRotation,
          y: preset.arms.y,
          duration,
          ease: emotion === 'eureka' || emotion === 'triumph' ? 'back.out(1.6)' : ease
        }, atTime);
      }

      // 7. Body Squash & Stretch
      if (preset.bodyScaleY) {
        tl.to(this.sel('root'), {
          scaleY: preset.bodyScaleY,
          duration: duration * 0.8,
          yoyo: true,
          repeat: 1,
          ease: 'power1.inOut'
        }, atTime);
      }

      // 8. Eureka Lightbulb Prop
      if (preset.propLightbulb) {
        tl.fromTo(this.sel('prop-lightbulb'),
          { opacity: 0, scale: 0, y: 15 },
          { opacity: 1, scale: 1, y: 0, duration: 0.35, ease: 'back.out(2.2)' },
          atTime
        );
      } else {
        tl.to(this.sel('prop-lightbulb'), {
          opacity: 0,
          scale: 0,
          duration: 0.2,
          ease: 'power2.in'
        }, atTime);
      }

      // 9. Emotion-specific secondary action
      if (emotion === 'scared') {
        // Shiver / Tremor
        this.addTremor(tl, atTime + 0.1, duration * 3.5);
      } else if (emotion === 'eureka') {
        // Confident hop
        tl.to(this.sel('root'), {
          y: -18,
          duration: 0.22,
          yoyo: true,
          repeat: 1,
          ease: 'power2.out'
        }, atTime);
      } else if (emotion === 'triumph') {
        // Victory hop
        tl.to(this.sel('root'), {
          y: -28,
          duration: 0.28,
          yoyo: true,
          repeat: 1,
          ease: 'power2.out'
        }, atTime);
      }

      return this;
    }

    /**
     * Morph mouth to specified viseme or shape
     * @param {gsap.core.Timeline} tl Target timeline
     * @param {'rest'|'A'|'O'|'E'|'U'|'smile'|'open-laugh'|'scared'} shape
     * @param {number} atTime Timeline insertion time (seconds)
     * @param {Object} [opts] Options
     */
    setMouth(tl, shape, atTime, opts = {}) {
      const shapeData = MOUTH_SHAPES[shape] || MOUTH_SHAPES['rest'];
      const duration = opts.duration ?? 0.12;
      const ease = opts.ease ?? 'power1.out';

      this.currentMouth = shape;

      tl.to(this.sel('mouth'), {
        attr: {
          d: shapeData.d,
          fill: shapeData.fill,
          stroke: shapeData.stroke,
          'stroke-width': shapeData.strokeWidth
        },
        duration,
        ease
      }, atTime);

      return this;
    }

    /**
     * Set eye expression state (blink, wink, look-left, look-right, shock)
     * @param {gsap.core.Timeline} tl Target timeline
     * @param {'normal'|'blink'|'look-left'|'look-right'|'look-center'|'wink'|'shock'} state
     * @param {number} atTime Timeline insertion time (seconds)
     * @param {Object} [opts] Options
     */
    setEyeState(tl, state, atTime, opts = {}) {
      const eyeData = EYE_STATES[state] || EYE_STATES['normal'];
      const duration = opts.duration ?? (state === 'blink' ? 0.1 : 0.25);
      const ease = opts.ease ?? 'power2.out';

      this.currentEyeState = state;

      if (state === 'blink') {
        // Quick blink
        tl.to([this.sel('eye-left'), this.sel('eye-right')], {
          scaleY: 0.05,
          duration: duration * 0.5,
          yoyo: true,
          repeat: 1,
          ease: 'power2.inOut'
        }, atTime);
      } else if (state === 'wink') {
        // Left eye winks shut, right eye stays open
        tl.to(this.sel('eye-left'), {
          scaleY: 0.08,
          duration: duration * 0.8,
          ease: 'power2.inOut'
        }, atTime);
        tl.to(this.sel('eye-right'), {
          scaleY: 1.0,
          scaleX: 1.05,
          duration,
          ease
        }, atTime);
      } else {
        // Both eyes update scale and pupil position
        tl.to([this.sel('eye-left'), this.sel('eye-right')], {
          scaleY: eyeData.scaleY,
          scaleX: eyeData.scaleX,
          duration,
          ease
        }, atTime);

        // Pupil horizontal shift (looking around)
        tl.to(this.sel('pupil-group-left'), {
          x: eyeData.pupilDx,
          duration,
          ease
        }, atTime);
        tl.to(this.sel('pupil-group-right'), {
          x: eyeData.pupilDx,
          duration,
          ease
        }, atTime);

        // Pupil radius
        tl.to([this.sel('pupil-left'), this.sel('pupil-right')], {
          attr: { r: eyeData.pupilRadius },
          duration,
          ease
        }, atTime);
      }

      return this;
    }

    /**
     * Set limb / arm pose
     * @param {gsap.core.Timeline} tl Target timeline
     * @param {'idle'|'point-up'|'panic'|'triumph'|'wave'|'talking'} pose
     * @param {number} atTime Timeline insertion time (seconds)
     * @param {Object} [opts] Options
     */
    setPose(tl, pose, atTime, opts = {}) {
      const duration = opts.duration ?? 0.35;
      const ease = opts.ease ?? 'power2.out';

      this.currentPose = pose;

      const POSES = {
        'idle': { left: 0, right: 0, y: 0 },
        'point-up': { left: 10, right: 80, y: -20 },
        'panic': { left: 40, right: -40, y: -6 },
        'triumph': { left: -80, right: 80, y: -28 },
        'wave': { left: 0, right: 60, y: -12 },
        'talking': { left: 15, right: -15, y: -2 }
      };

      const p = POSES[pose] || POSES['idle'];

      tl.to(this.sel('arm-left'), {
        rotation: p.left,
        y: p.y,
        duration,
        ease
      }, atTime);

      tl.to(this.sel('arm-right'), {
        rotation: p.right,
        y: p.y,
        duration,
        ease
      }, atTime);

      return this;
    }

    /**
     * Apply synchronized lip-sync visemes across timeline
     * @param {gsap.core.Timeline} tl Target timeline
     * @param {Array<{time: number, mouth: string, duration: number}>} visemes
     * @param {number} [startTime=0] Absolute timeline offset
     * @param {Object} [opts] Options
     */
    applyLipSync(tl, visemes, startTime = 0, opts = {}) {
      if (!Array.isArray(visemes) || visemes.length === 0) return this;

      const bounceIntensity = opts.bounceIntensity ?? 3;

      for (let i = 0; i < visemes.length; i++) {
        const kf = visemes[i];
        const at = startTime + kf.time;
        const dur = Math.max(0.06, kf.duration * 0.95);

        this.setMouth(tl, kf.mouth, at, { duration: dur });

        // Subtle jaw / speech head bounce on vowel peaks
        if (['A', 'O', 'open-laugh'].includes(kf.mouth) && bounceIntensity > 0) {
          tl.to(this.sel('torso'), {
            y: bounceIntensity,
            duration: dur * 0.45,
            yoyo: true,
            repeat: 1,
            ease: 'sine.inOut'
          }, at);
        }
      }

      return this;
    }

    /**
     * Add deterministic eye blink loop across [startTime, startTime + duration]
     * Satisfies HyperFrames Rule 4: strictly timeline-deterministic, no unseeded Math.random() or repeat: -1.
     */
    addBlinkLoop(tl, startTime, duration, opts = {}) {
      const interval = opts.interval ?? 2.8;
      const count = Math.floor(duration / interval);

      for (let i = 1; i <= count; i++) {
        const jitter = ((i * 37) % 10) * 0.08 - 0.35;
        const t = startTime + i * interval + jitter;
        if (t + 0.15 < startTime + duration) {
          this.setEyeState(tl, 'blink', t);
        }
      }

      return this;
    }

    /**
     * Add subtle organic breathing motion
     */
    addBreathing(tl, startTime, duration, opts = {}) {
      const cycleDuration = opts.cycleDuration ?? 2.4;
      const cycles = Math.floor(duration / cycleDuration);

      for (let i = 0; i < cycles; i++) {
        const t = startTime + i * cycleDuration;
        tl.to(this.sel('torso'), {
          scaleY: 1.025,
          duration: cycleDuration * 0.5,
          yoyo: true,
          repeat: 1,
          ease: 'sine.inOut'
        }, t);
      }

      return this;
    }

    /**
     * Add rapid fear/tremor vibration
     */
    addTremor(tl, startTime, duration, opts = {}) {
      const step = opts.step ?? 0.05;
      const steps = Math.floor(duration / step);
      const intensity = opts.intensity ?? 4;

      for (let i = 0; i < steps; i++) {
        const t = startTime + i * step;
        const dx = (i % 2 === 0 ? 1 : -1) * intensity;
        tl.to(this.sel('root'), {
          x: dx,
          duration: step,
          ease: 'none'
        }, t);
      }

      tl.to(this.sel('root'), { x: 0, duration: 0.08, ease: 'power1.out' }, startTime + duration);

      return this;
    }
  }

  return CharacterRig;
});
