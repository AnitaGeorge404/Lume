/**
 * intentEngine.js — Intent Interpretation
 * ─────────────────────────────────────────
 * Translates human input into structured design intent.
 *
 * Design philosophy:
 * People don't say "apply dark mode with a minimal radius profile."
 * They say "like Linear" or "calmer" or "more Spotify vibes."
 * This module understands those expressions.
 *
 * Architecture:
 * 1. Signal extraction  — find semantic tags in the input
 * 2. Profile scoring    — score each profile against found tags
 * 3. Memory weighting   — nudge scores based on past user preferences
 * 4. Intent resolution  — pick winner and build reasoning string
 */

// ─── Memory layer (localStorage) ──────────────────────────────────────────────

const MEMORY_KEY = 'lume_prefs_v1'

export function loadMemory() {
  try {
    const raw = localStorage.getItem(MEMORY_KEY)
    if (!raw) return { profileHits: {}, history: [], sessionCount: 0 }
    return JSON.parse(raw)
  } catch {
    return { profileHits: {}, history: [], sessionCount: 0 }
  }
}

export function saveToMemory(profileKey, promptText) {
  try {
    const mem = loadMemory()
    mem.profileHits[profileKey] = (mem.profileHits[profileKey] ?? 0) + 1
    mem.history = [promptText, ...(mem.history ?? [])].slice(0, 12)
    mem.sessionCount = (mem.sessionCount ?? 0) + 1
    localStorage.setItem(MEMORY_KEY, JSON.stringify(mem))
  } catch {
    // localStorage unavailable — graceful degradation
  }
}

export function clearMemory() {
  try { localStorage.removeItem(MEMORY_KEY) } catch { /* noop */ }
}

export function getDominantProfile(memory) {
  const hits = memory?.profileHits ?? {}
  let best = null, bestCount = 0
  for (const [key, count] of Object.entries(hits)) {
    if (count > bestCount) { best = key; bestCount = count }
  }
  return best
}

// ─── Semantic signal vocabulary ────────────────────────────────────────────────
// Maps words/phrases → semantic tags (internal signals)
// A single phrase can produce multiple tags.

const SIGNAL_MAP = [
  // ── Luminosity ──────────────────────────────────────────────────────────────
  { patterns: ['dark', 'night', 'midnight', 'black', 'shadow', 'noir', 'dim'],     tags: ['dark']    },
  { patterns: ['light', 'bright', 'white', 'day', 'airy', 'clean'],               tags: ['light']   },

  // ── Temperature ─────────────────────────────────────────────────────────────
  { patterns: ['warm', 'earthy', 'cozy', 'amber', 'honey', 'autumn', 'rustic', 'terracotta'], tags: ['warm'] },
  { patterns: ['cool', 'cold', 'icy', 'glacier', 'frost', 'arctic', 'steel'],     tags: ['cool']    },
  { patterns: ['ocean', 'sea', 'navy', 'teal', 'aqua', 'coastal'],                tags: ['cool', 'calm']  },
  { patterns: ['forest', 'nature', 'green', 'organic', 'botanical'],              tags: ['warm', 'calm']  },
  { patterns: ['sunset', 'golden', 'orange', 'peach'],                            tags: ['warm', 'playful'] },

  // ── Energy ──────────────────────────────────────────────────────────────────
  { patterns: ['playful', 'fun', 'colorful', 'vibrant', 'bouncy', 'joyful', 'cheerful', 'bright'], tags: ['playful'] },
  { patterns: ['calm', 'serene', 'quiet', 'peaceful', 'gentle', 'subtle', 'mellow'],  tags: ['calm']    },
  { patterns: ['energetic', 'bold', 'vivid', 'loud', 'strong', 'punchy'],          tags: ['bold']    },
  { patterns: ['electric', 'neon', 'glow', 'cyber', 'cyberpunk', 'laser', 'glowing', 'rave'], tags: ['neon'] },

  // ── Formality ───────────────────────────────────────────────────────────────
  { patterns: ['minimal', 'clean', 'simple', 'bare', 'stripped', 'sparse', 'restrained'], tags: ['minimal'] },
  { patterns: ['corporate', 'professional', 'business', 'enterprise', 'formal', 'serious'], tags: ['corporate'] },
  { patterns: ['friendly', 'approachable', 'welcoming', 'social', 'casual'],       tags: ['friendly'] },
  { patterns: ['premium', 'luxury', 'elite', 'high-end', 'refined', 'polished', 'sophisticated'], tags: ['premium'] },
  { patterns: ['technical', 'developer', 'code', 'dev', 'engineering', 'hacker'],  tags: ['technical'] },

  // ── Softness ────────────────────────────────────────────────────────────────
  { patterns: ['soft', 'romantic', 'dreamy', 'gentle', 'pastel', 'blush', 'rose', 'love', 'heart'], tags: ['soft'] },
  { patterns: ['sharp', 'crisp', 'precise', 'angular', 'exact'],                   tags: ['sharp']   },
  { patterns: ['rounded', 'bubbly', 'pill', 'smooth'],                             tags: ['rounded'] },

  // ── Brand references ────────────────────────────────────────────────────────
  { patterns: ['stripe'],   tags: ['premium', 'corporate', 'minimal', 'cool'] },
  { patterns: ['linear'],   tags: ['dark', 'minimal', 'technical', 'sharp']   },
  { patterns: ['notion'],   tags: ['minimal', 'calm', 'light']                },
  { patterns: ['duolingo'], tags: ['playful', 'rounded', 'bold', 'friendly']  },
  { patterns: ['apple'],    tags: ['premium', 'minimal', 'calm', 'sharp']     },
  { patterns: ['figma'],    tags: ['dark', 'technical', 'minimal']            },
  { patterns: ['vercel'],   tags: ['dark', 'minimal', 'sharp', 'technical']   },
  { patterns: ['airbnb'],   tags: ['warm', 'friendly', 'rounded']             },
  { patterns: ['spotify'],  tags: ['dark', 'neon', 'bold', 'playful']         },
  { patterns: ['twitter', 'x.com'], tags: ['dark', 'minimal', 'corporate']   },
  { patterns: ['github'],   tags: ['dark', 'technical', 'minimal']            },
  { patterns: ['discord'],  tags: ['dark', 'neon', 'friendly', 'rounded']     },
]

// ─── Profile → tag alignment ───────────────────────────────────────────────────
// Each profile is described by the tags it embodies.
// Used for scoring: how well does a profile serve the intent?

const PROFILE_TAGS = {
  default:   ['light', 'friendly', 'calm'],
  minimal:   ['minimal', 'light', 'calm', 'sharp', 'technical'],
  playful:   ['playful', 'rounded', 'warm', 'bold', 'friendly'],
  soft:      ['soft', 'warm', 'rounded', 'calm', 'light'],
  dark:      ['dark', 'minimal', 'cool', 'technical', 'calm'],
  neon:      ['neon', 'dark', 'bold', 'sharp', 'technical'],
  corporate: ['corporate', 'cool', 'minimal', 'sharp', 'premium'],
  warm:      ['warm', 'friendly', 'calm', 'rounded'],
  premium:   ['premium', 'sharp', 'cool', 'calm', 'minimal'],
  electric:  ['neon', 'dark', 'bold', 'playful', 'cool'],
}

// ─── Signal extraction ─────────────────────────────────────────────────────────

function extractTags(text) {
  const lower = text.toLowerCase()
  const found = new Set()
  const brandRef = null

  for (const entry of SIGNAL_MAP) {
    if (entry.patterns.some(p => lower.includes(p))) {
      entry.tags.forEach(t => found.add(t))
    }
  }
  return { tags: [...found], brandRef }
}

// ─── Profile scoring ───────────────────────────────────────────────────────────

function scoreProfiles(tags, memory) {
  const hits = memory?.profileHits ?? {}
  const scores = {}

  for (const [profileKey, profileTags] of Object.entries(PROFILE_TAGS)) {
    let score = 0

    // Tag alignment: 2 points per direct tag match
    for (const tag of tags) {
      if (profileTags.includes(tag)) score += 2
    }

    // Memory bonus: 0.3 points per previous hit (max 1.5 points, gentle nudge)
    const memoryBonus = Math.min((hits[profileKey] ?? 0) * 0.3, 1.5)
    score += memoryBonus

    scores[profileKey] = Math.round(score * 10) / 10
  }

  return scores
}

// ─── Intent resolution ─────────────────────────────────────────────────────────

/** Human-readable explanations of tags */
const TAG_DESCRIPTIONS = {
  dark:      'dark background',
  light:     'light background',
  warm:      'warm color palette',
  cool:      'cool color palette',
  playful:   'playful personality',
  calm:      'calm and restrained',
  bold:      'bold and energetic',
  neon:      'neon glow effects',
  minimal:   'minimal design',
  corporate: 'professional style',
  premium:   'premium aesthetic',
  technical: 'technical precision',
  soft:      'soft and gentle',
  sharp:     'sharp corners',
  rounded:   'rounded corners',
  friendly:  'friendly and approachable',
}

function buildReasoning(tags, profileKey, confidence, memory) {
  if (tags.length === 0) return null

  const tagDescriptions = tags
    .filter(t => TAG_DESCRIPTIONS[t])
    .map(t => TAG_DESCRIPTIONS[t])
    .slice(0, 3)

  const dominant = getDominantProfile(memory)
  const memNote = dominant && dominant === profileKey && (memory?.sessionCount ?? 0) > 2
    ? ' · matches your taste history'
    : ''

  if (tagDescriptions.length === 0) return null

  const detected = tagDescriptions.length === 1
    ? tagDescriptions[0]
    : `${tagDescriptions.slice(0, -1).join(', ')} and ${tagDescriptions[tagDescriptions.length - 1]}`

  return `Detected: ${detected}${memNote}`
}

// ─── Main export ───────────────────────────────────────────────────────────────

/**
 * Interpret a free-form text prompt into structured design intent.
 *
 * @param {string} text      — the user's input
 * @param {object} memory    — from loadMemory()
 * @returns {{ profileKey, confidence, tags, reasoning }}
 */
export function interpretIntent(text, memory = {}) {
  const trimmed = text.trim().toLowerCase()

  if (!trimmed) {
    return { profileKey: 'default', confidence: 1, tags: [], reasoning: null }
  }

  const { tags } = extractTags(trimmed)

  if (tags.length === 0) {
    // No recognized signals — try simple fallback so it never fails silently
    return {
      profileKey: 'default',
      confidence:  0.3,
      tags:        [],
      reasoning:   `Could not extract a clear design intent from "${text}". Keeping default style.`,
    }
  }

  const scores = scoreProfiles(tags, memory)

  // Sort by score desc, pick the winner
  const sorted = Object.entries(scores)
    .sort(([, a], [, b]) => b - a)
    .filter(([, s]) => s > 0)

  if (!sorted.length) {
    return { profileKey: 'default', confidence: 0.3, tags, reasoning: null }
  }

  const [profileKey, topScore] = sorted[0]
  const secondScore = sorted[1]?.[1] ?? 0
  // Confidence: high if clear winner, lower if close contest
  const confidence = Math.min(0.99, topScore === 0 ? 0.3 : secondScore === 0 ? 0.9 : Math.min(0.9, topScore / (topScore + secondScore)))

  const reasoning = buildReasoning(tags, profileKey, confidence, memory)

  return { profileKey, confidence, tags, reasoning }
}
