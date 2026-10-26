/**
 * Structured SVG Character Rig Generator for HyperFrames
 * Standardized modular 2D vector character model (Brainy & customizable mascot).
 */

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else if (typeof define === 'function' && define.amd) {
    define(factory);
  } else {
    root.CharacterSvg = factory();
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  /**
   * Generate SVG markup for a modular character rig
   * @param {Object} options Configuration options
   * @param {string} options.id Unique prefix/id for this character instance
   * @param {number} [options.width=400] ViewBox width
   * @param {number} [options.height=400] ViewBox height
   * @param {string} [options.type='brainy'] Character type ('brainy', 'mascot')
   * @param {string} [options.primaryColor='#FF7597'] Gradient primary color
   * @param {string} [options.accentColor='#E11D48'] Gradient accent color
   * @param {boolean} [options.hasGlasses=true] Include glasses accessory
   * @param {boolean} [options.hasShadow=true] Include ground drop shadow
   */
  function renderCharacterSvg(options = {}) {
    const id = options.id || 'brainy';
    const width = options.width || 400;
    const height = options.height || 400;
    const hasGlasses = options.hasGlasses !== false;
    const hasShadow = options.hasShadow !== false;

    return `
<svg
  id="${id}-svg"
  class="character-rig-svg"
  viewBox="0 0 ${width} ${height}"
  width="100%"
  height="100%"
  xmlns="http://www.w3.org/2000/svg"
  style="display: block; overflow: visible;"
>
  <defs>
    <!-- Body Gradients -->
    <linearGradient id="${id}-grad-body" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FF7597" />
      <stop offset="60%" stop-color="#FF4D79" />
      <stop offset="100%" stop-color="#E11D48" />
    </linearGradient>

    <linearGradient id="${id}-grad-crease" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#E11D48" />
      <stop offset="100%" stop-color="#9F1239" />
    </linearGradient>

    <!-- Glasses Rim Gradient -->
    <linearGradient id="${id}-grad-glasses" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#00F0FF" />
      <stop offset="100%" stop-color="#0284C7" />
    </linearGradient>

    <!-- Eureka Lightbulb Glow Gradient -->
    <radialGradient id="${id}-grad-bulb" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#FFFBEB" />
      <stop offset="50%" stop-color="#FBBF24" />
      <stop offset="100%" stop-color="#D97706" />
    </radialGradient>

    <!-- Drop Shadow Filter -->
    <filter id="${id}-blur-shadow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="8" />
    </filter>

    <filter id="${id}-blush-blur" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="5" />
    </filter>
  </defs>

  ${hasShadow ? `
  <!-- Ground Contact Shadow -->
  <g id="${id}-shadow-group">
    <ellipse
      id="${id}-shadow"
      cx="200"
      cy="375"
      rx="90"
      ry="16"
      fill="rgba(15, 23, 42, 0.4)"
      filter="url(#${id}-blur-shadow)"
    />
  </g>` : ''}

  <!-- Main Rig Container for Whole-Body Squash/Stretch and Translation -->
  <g id="${id}-root" class="char-body-root">

    <!-- Legs & Shoes -->
    <g id="${id}-legs">
      <!-- Left Leg & Shoe -->
      <g id="${id}-leg-left">
        <rect x="155" y="305" width="16" height="50" rx="8" fill="#BE123C" />
        <ellipse cx="155" cy="358" rx="26" ry="14" fill="#FFFFFF" stroke="#9F1239" stroke-width="2" />
        <ellipse cx="152" cy="355" rx="14" ry="6" fill="#F1F5F9" />
        <!-- Shoe Sole -->
        <path d="M 130 364 Q 155 368 180 364" stroke="#BE123C" stroke-width="4" stroke-linecap="round" fill="none" />
      </g>

      <!-- Right Leg & Shoe -->
      <g id="${id}-leg-right">
        <rect x="230" y="305" width="16" height="50" rx="8" fill="#BE123C" />
        <ellipse cx="245" cy="358" rx="26" ry="14" fill="#FFFFFF" stroke="#9F1239" stroke-width="2" />
        <ellipse cx="242" cy="355" rx="14" ry="6" fill="#F1F5F9" />
        <!-- Shoe Sole -->
        <path d="M 220 364 Q 245 368 270 364" stroke="#BE123C" stroke-width="4" stroke-linecap="round" fill="none" />
      </g>
    </g>

    <!-- Torso / Head Group -->
    <g id="${id}-torso">
      <!-- Brain Lobes Silhouette -->
      <g id="${id}-lobes">
        <!-- Top Left Lobe -->
        <circle cx="150" cy="160" r="70" fill="url(#${id}-grad-body)" />
        <!-- Top Right Lobe -->
        <circle cx="250" cy="160" r="70" fill="url(#${id}-grad-body)" />
        <!-- Mid Left Lobe -->
        <circle cx="125" cy="225" r="65" fill="url(#${id}-grad-body)" />
        <!-- Mid Right Lobe -->
        <circle cx="275" cy="225" r="65" fill="url(#${id}-grad-body)" />
        <!-- Center Core Mass -->
        <ellipse cx="200" cy="210" rx="92" ry="86" fill="url(#${id}-grad-body)" />
      </g>

      <!-- Brain Convolutions / Stylized Creases -->
      <g id="${id}-creases" opacity="0.95">
        <!-- Left Creases -->
        <path d="M 140 120 Q 170 140 150 175 Q 130 200 160 215" stroke="url(#${id}-grad-crease)" stroke-width="8" stroke-linecap="round" fill="none" />
        <path d="M 100 185 Q 130 190 120 230" stroke="url(#${id}-grad-crease)" stroke-width="7" stroke-linecap="round" fill="none" />
        <path d="M 115 250 Q 150 260 160 290" stroke="url(#${id}-grad-crease)" stroke-width="7" stroke-linecap="round" fill="none" />

        <!-- Right Creases -->
        <path d="M 260 120 Q 230 140 250 175 Q 270 200 240 215" stroke="url(#${id}-grad-crease)" stroke-width="8" stroke-linecap="round" fill="none" />
        <path d="M 300 185 Q 270 190 280 230" stroke="url(#${id}-grad-crease)" stroke-width="7" stroke-linecap="round" fill="none" />
        <path d="M 285 250 Q 250 260 240 290" stroke="url(#${id}-grad-crease)" stroke-width="7" stroke-linecap="round" fill="none" />

        <!-- Central Fissure -->
        <path d="M 200 105 Q 192 150 205 180" stroke="url(#${id}-grad-crease)" stroke-width="8" stroke-linecap="round" fill="none" />
      </g>

      <!-- Rosy Cheeks (Blush) -->
      <g id="${id}-blush-group">
        <circle id="${id}-blush-left" cx="135" cy="246" r="18" fill="#FF1744" opacity="0" filter="url(#${id}-blush-blur)" />
        <circle id="${id}-blush-right" cx="265" cy="246" r="18" fill="#FF1744" opacity="0" filter="url(#${id}-blush-blur)" />
      </g>

      <!-- Eyebrows (Morphable & Rotatable) -->
      <g id="${id}-brows">
        <path
          id="${id}-brow-left"
          d="M 140 180 Q 165 170 185 180"
          stroke="#881337"
          stroke-width="8"
          stroke-linecap="round"
          fill="none"
        />
        <path
          id="${id}-brow-right"
          d="M 215 180 Q 235 170 260 180"
          stroke="#881337"
          stroke-width="8"
          stroke-linecap="round"
          fill="none"
        />
      </g>

      <!-- Eyes Group -->
      <g id="${id}-eyes">
        <!-- Left Eye -->
        <g id="${id}-eye-left">
          <!-- White Sclera -->
          <ellipse cx="160" cy="205" rx="24" ry="26" fill="#FFFFFF" stroke="#BE123C" stroke-width="3" />
          <!-- Pupil & Reflections -->
          <g id="${id}-pupil-group-left">
            <circle id="${id}-pupil-left" cx="162" cy="205" r="13" fill="#0F172A" />
            <circle id="${id}-pupil-shine-left" cx="166" cy="200" r="5" fill="#FFFFFF" />
            <circle id="${id}-pupil-subshine-left" cx="159" cy="210" r="2" fill="#FFFFFF" opacity="0.8" />
          </g>
        </g>

        <!-- Right Eye -->
        <g id="${id}-eye-right">
          <!-- White Sclera -->
          <ellipse cx="240" cy="205" rx="24" ry="26" fill="#FFFFFF" stroke="#BE123C" stroke-width="3" />
          <!-- Pupil & Reflections -->
          <g id="${id}-pupil-group-right">
            <circle id="${id}-pupil-right" cx="238" cy="205" r="13" fill="#0F172A" />
            <circle id="${id}-pupil-shine-right" cx="242" cy="200" r="5" fill="#FFFFFF" />
            <circle id="${id}-pupil-subshine-right" cx="235" cy="210" r="2" fill="#FFFFFF" opacity="0.8" />
          </g>
        </g>
      </g>

      ${hasGlasses ? `
      <!-- Glasses / Nerd Specs Accessory -->
      <g id="${id}-glasses">
        <!-- Left Lens Rim -->
        <circle cx="160" cy="205" r="32" fill="rgba(0, 240, 255, 0.08)" stroke="url(#${id}-grad-glasses)" stroke-width="6" />
        <!-- Right Lens Rim -->
        <circle cx="240" cy="205" r="32" fill="rgba(0, 240, 255, 0.08)" stroke="url(#${id}-grad-glasses)" stroke-width="6" />
        <!-- Bridge Connecting Lenses -->
        <path d="M 192 205 Q 200 196 208 205" stroke="url(#${id}-grad-glasses)" stroke-width="6" stroke-linecap="round" fill="none" />
        <!-- Temples -->
        <line x1="128" y1="205" x2="114" y2="201" stroke="url(#${id}-grad-glasses)" stroke-width="5" stroke-linecap="round" />
        <line x1="272" y1="205" x2="286" y2="201" stroke="url(#${id}-grad-glasses)" stroke-width="5" stroke-linecap="round" />
        <!-- Dynamic Glass Shine Glint -->
        <path id="${id}-glasses-glint" d="M 148 185 L 172 225" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round" opacity="0.6" />
        <path d="M 228 185 L 252 225" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round" opacity="0.6" />
      </g>` : ''}

      <!-- Mouth Viseme Group -->
      <g id="${id}-mouth-group">
        <path
          id="${id}-mouth"
          d="M 175 255 Q 200 252 225 255 Q 200 256 175 255 Z"
          stroke="#4C0519"
          stroke-width="4"
          stroke-linecap="round"
          stroke-linejoin="round"
          fill="#881337"
        />
      </g>
    </g> <!-- /#${id}-torso -->

    <!-- Limbs: Arms & Hands -->
    <g id="${id}-arms">
      <!-- Left Arm & Glove (Shoulder Joint at 110, 240) -->
      <g id="${id}-arm-left" class="char-arm">
        <path id="${id}-arm-left-path" d="M 110 240 Q 80 260 75 290" stroke="#FF4D79" stroke-width="14" stroke-linecap="round" fill="none" />
        <!-- White Glove -->
        <circle cx="75" cy="295" r="16" fill="#FFFFFF" stroke="#9F1239" stroke-width="2" />
        <ellipse cx="68" cy="290" rx="6" ry="10" fill="#FFFFFF" stroke="#9F1239" stroke-width="2" transform="rotate(-30 68 290)" />
      </g>

      <!-- Right Arm & Glove (Shoulder Joint at 290, 240) -->
      <g id="${id}-arm-right" class="char-arm">
        <path id="${id}-arm-right-path" d="M 290 240 Q 320 260 325 290" stroke="#FF4D79" stroke-width="14" stroke-linecap="round" fill="none" />
        <!-- White Glove -->
        <circle cx="325" cy="295" r="16" fill="#FFFFFF" stroke="#9F1239" stroke-width="2" />
        <ellipse cx="332" cy="290" rx="6" ry="10" fill="#FFFFFF" stroke="#9F1239" stroke-width="2" transform="rotate(30 332 290)" />
      </g>
    </g>

    <!-- Props: Eureka Lightbulb (Initially hidden) -->
    <g
      id="${id}-prop-lightbulb"
      class="char-prop"
      opacity="0"
    >
      <!-- Glow Aura -->
      <circle cx="200" cy="50" r="42" fill="url(#${id}-grad-bulb)" opacity="0.3" filter="url(#${id}-blur-shadow)" />
      <!-- Bulb Glass -->
      <circle cx="200" cy="50" r="28" fill="url(#${id}-grad-bulb)" stroke="#FDE68A" stroke-width="3" />
      <rect x="193" y="75" width="14" height="10" rx="3" fill="#94A3B8" />
      <rect x="195" y="85" width="10" height="4" rx="2" fill="#64748B" />
      <!-- Glowing Rays -->
      <line x1="200" y1="12" x2="200" y2="4" stroke="#FBBF24" stroke-width="5" stroke-linecap="round" />
      <line x1="168" y1="24" x2="162" y2="18" stroke="#FBBF24" stroke-width="5" stroke-linecap="round" />
      <line x1="232" y1="24" x2="238" y2="18" stroke="#FBBF24" stroke-width="5" stroke-linecap="round" />
      <line x1="158" y1="52" x2="150" y2="52" stroke="#FBBF24" stroke-width="5" stroke-linecap="round" />
      <line x1="242" y1="52" x2="250" y2="52" stroke="#FBBF24" stroke-width="5" stroke-linecap="round" />
    </g>

  </g> <!-- /#${id}-root -->
</svg>
`;
  }

  return {
    renderCharacterSvg
  };
});
