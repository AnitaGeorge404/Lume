/**
 * semantics.js — The Semantic Layer
 * ──────────────────────────────────
 * Components are not just visual primitives.
 * They carry meaning: what they ARE, what they REPRESENT,
 * and how they should FEEL to the people using them.
 *
 * This module is the foundation that everything else builds on.
 * Styles, animations, code output, and accessibility behavior
 * are all downstream of semantic intent — not arbitrary decisions.
 */

// ─── Component semantic roles ──────────────────────────────────────────────────
// Each component type has an intrinsic meaning in UI vocabulary.
// These don't change based on style — they are fundamental.

export const SEMANTIC_ROLES = {
  Button:  {
    intent:      'action',
    feeling:     'decisive',
    role:        'trigger',
    aria:        'button',
    description: 'Initiates an action. Users must feel it responds.',
  },
  Card: {
    intent:      'information',
    feeling:     'contained',
    role:        'container',
    aria:        'article',
    description: 'Holds and groups related content. Should feel safe and clear.',
  },
  Slider: {
    intent:      'control',
    feeling:     'continuous',
    role:        'input',
    aria:        'slider',
    description: 'Adjusts a value on a range. Progress should feel tangible.',
  },
  Input: {
    intent:      'capture',
    feeling:     'receptive',
    role:        'field',
    aria:        'textbox',
    description: 'Awaits user input. Should feel inviting, not demanding.',
  },
  Badge: {
    intent:      'signal',
    feeling:     'compact',
    role:        'indicator',
    aria:        'status',
    description: 'Conveys a small but important piece of state or identity.',
  },
  Divider: {
    intent:      'separation',
    feeling:     'neutral',
    role:        'layout',
    aria:        'separator',
    description: 'Creates visual breathing room. Should be invisible when working.',
  },
}

// ─── Animation profiles ────────────────────────────────────────────────────────
// Driven by semantic feeling, not aesthetic preference.
// These are timing values — they govern how the component RESPONDS.

export const ANIMATION_PROFILES = {
  decisive: {
    // Buttons snap. They don't linger.
    duration:       120,
    hoverDuration:  80,
    easing:         'cubic-bezier(0.2, 0, 0.2, 1)',
    pressScale:     0.961,
    hoverLift:      '-2px',
    hoverBrightness: 1.08,
    feedbackDelay:  0,
  },
  contained: {
    // Cards breathe. Hover reveals depth.
    duration:       220,
    hoverDuration:  180,
    easing:         'cubic-bezier(0.4, 0, 0.2, 1)',
    pressScale:     1,
    hoverLift:      '-3px',
    hoverBrightness: 1,
    feedbackDelay:  0,
  },
  continuous: {
    // Sliders are instant. No animation — just direct control.
    duration:       0,
    hoverDuration:  100,
    easing:         'linear',
    pressScale:     1,
    hoverLift:      '0',
    hoverBrightness: 1,
    feedbackDelay:  0,
  },
  receptive: {
    // Inputs respond gently to focus. They open up.
    duration:       160,
    hoverDuration:  100,
    easing:         'cubic-bezier(0.4, 0, 0.2, 1)',
    pressScale:     1,
    hoverLift:      '0',
    hoverBrightness: 1,
    feedbackDelay:  0,
  },
  compact: {
    // Badges pulse briefly, then settle.
    duration:       100,
    hoverDuration:  80,
    easing:         'cubic-bezier(0.2, 0, 0.2, 1)',
    pressScale:     0.94,
    hoverLift:      '0',
    hoverBrightness: 1.04,
    feedbackDelay:  0,
  },
  neutral: {
    // Dividers don't move.
    duration:       0,
    hoverDuration:  0,
    easing:         'linear',
    pressScale:     1,
    hoverLift:      '0',
    hoverBrightness: 1,
    feedbackDelay:  0,
  },
}

// ─── Feeling → style personality ──────────────────────────────────────────────
// A "feeling" is a design personality that modifies how visual properties
// are expressed. Same component, different character.

export const FEELING_MODIFIERS = {
  soft: {
    description:    'Approachable and gentle. Rounded, low-contrast.',
    radiusMult:     1.8,
    shadowIntensity: 0.6,
    fontWeight:     400,
    letterSpacing:  '0.01em',
    borderOpacity:  0.5,
  },
  playful: {
    description:    'Energetic and expressive. Bouncy, vibrant.',
    radiusMult:     2.2,
    shadowIntensity: 1.0,
    fontWeight:     700,
    letterSpacing:  '0.02em',
    borderOpacity:  0.8,
  },
  premium: {
    description:    'Refined and confident. Precise corners, deep shadows.',
    radiusMult:     0.55,
    shadowIntensity: 1.6,
    fontWeight:     600,
    letterSpacing:  '0.05em',
    borderOpacity:  0.6,
  },
  minimal: {
    description:    'Restrained and clear. No decoration beyond necessity.',
    radiusMult:     0.4,
    shadowIntensity: 0,
    fontWeight:     500,
    letterSpacing:  '0.03em',
    borderOpacity:  1.0,
  },
  calm: {
    description:    'Quiet and focused. Nothing competes for attention.',
    radiusMult:     1.3,
    shadowIntensity: 0.35,
    fontWeight:     400,
    letterSpacing:  '0.01em',
    borderOpacity:  0.4,
  },
  bold: {
    description:    'Direct and confident. Clear hierarchy.',
    radiusMult:     0.6,
    shadowIntensity: 0.8,
    fontWeight:     800,
    letterSpacing:  '0.04em',
    borderOpacity:  1.0,
  },
  friendly: {
    description:    'Warm and welcoming. Invites participation.',
    radiusMult:     1.6,
    shadowIntensity: 0.65,
    fontWeight:     600,
    letterSpacing:  '0.01em',
    borderOpacity:  0.6,
  },
  technical: {
    description:    'Precise and structured. Respects the professional.',
    radiusMult:     0.4,
    shadowIntensity: 0.3,
    fontWeight:     500,
    letterSpacing:  '0.025em',
    borderOpacity:  1.0,
  },
}

// ─── getAnimProfile ────────────────────────────────────────────────────────────
// Look up the animation profile for a component type.

export function getAnimProfile(type) {
  const role = SEMANTIC_ROLES[type]
  if (!role) return ANIMATION_PROFILES.neutral
  return ANIMATION_PROFILES[role.feeling] ?? ANIMATION_PROFILES.neutral
}

// ─── getFeelingModifier ────────────────────────────────────────────────────────
// Look up a feeling modifier by name. Returns null if not found.

export function getFeelingModifier(feeling) {
  return FEELING_MODIFIERS[feeling] ?? null
}
