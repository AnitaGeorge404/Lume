import { interpretIntent, loadMemory, saveToMemory } from './intentEngine'

export const PRESETS = [
  { label: '✨ Default',   prompt: '' },
  { label: '⬛ Minimal',   prompt: 'minimal' },
  { label: '🎉 Playful',   prompt: 'playful' },
  { label: '💖 Soft',      prompt: 'soft colors romantic' },
  { label: '🌙 Dark',      prompt: 'dark mode' },
  { label: '⚡ Neon',      prompt: 'neon glow' },
  { label: '💎 Premium',   prompt: 'premium sophisticated' },
  { label: '🏢 Corporate', prompt: 'corporate professional' },
  { label: '🌅 Warm',      prompt: 'warm earthy' },
  { label: '⚡ Electric',  prompt: 'electric spotify dark' },
]

const PROFILES = {
  default: {
    mood: 'default',
    surface:   '#ffffff',
    text:      '#111827',
    accent:    '#6366f1',
    bg:        '#f4f7fb',
    radius:    12,
    shadow:    true,
    fontStyle: 'normal',
    sliderDecoration: 'none',
    perType: {
      Button:  { fill: '#6366f1', text: '#ffffff', border: '#4f46e5' },
      Card:    { fill: '#ffffff', text: '#111827', border: '#e2e8f0' },
      Slider:  { fill: '#0ea5e9', text: '#0c4a6e', border: '#0284c7' },
      Input:   { fill: '#f8fafc', text: '#334155', border: '#94a3b8' },
      Badge:   { fill: '#ede9fe', text: '#5b21b6', border: '#c4b5fd' },
      Divider: { fill: 'transparent', text: '#94a3b8', border: '#e2e8f0' },
    },
  },
  minimal: {
    mood: 'minimal',
    surface:   '#ffffff',
    text:      '#111827',
    accent:    '#111827',
    bg:        '#fafafa',
    radius:    6,
    shadow:    false,
    fontStyle: 'normal',
    sliderDecoration: 'none',
    perType: {
      Button:  { fill: '#111827', text: '#ffffff', border: '#111827' },
      Card:    { fill: '#ffffff', text: '#111827', border: '#d1d5db' },
      Slider:  { fill: 'transparent', text: '#374151', border: '#9ca3af' },
      Input:   { fill: '#ffffff', text: '#111827', border: '#d1d5db' },
      Badge:   { fill: '#f3f4f6', text: '#374151', border: '#d1d5db' },
      Divider: { fill: 'transparent', text: '#d1d5db', border: '#e5e7eb' },
    },
  },
  playful: {
    mood: 'playful',
    surface:   '#fef9ee',
    text:      '#1c1917',
    accent:    '#f97316',
    bg:        '#fef9ee',
    radius:    20,
    shadow:    true,
    fontStyle: 'normal',
    sliderDecoration: 'stars',
    perType: {
      Button:  { fill: '#f97316', text: '#ffffff', border: '#ea580c' },
      Card:    { fill: '#fff7ed', text: '#1c1917', border: '#fed7aa' },
      Slider:  { fill: '#a855f7', text: '#ffffff', border: '#9333ea' },
      Input:   { fill: '#ffffff', text: '#1c1917', border: '#fdba74' },
      Badge:   { fill: '#fdf4ff', text: '#86198f', border: '#e879f9' },
      Divider: { fill: 'transparent', text: '#fb923c', border: '#fed7aa' },
    },
  },
  soft: {
    mood: 'soft',
    surface:   '#fff1f2',
    text:      '#881337',
    accent:    '#f43f5e',
    bg:        '#fff1f2',
    radius:    18,
    shadow:    true,
    fontStyle: 'italic',
    sliderDecoration: 'heart',
    perType: {
      Button:  { fill: '#f43f5e', text: '#ffffff', border: '#e11d48' },
      Card:    { fill: '#fff1f2', text: '#881337', border: '#fecdd3' },
      Slider:  { fill: '#fb7185', text: '#ffffff', border: '#f43f5e' },
      Input:   { fill: '#ffffff', text: '#9f1239', border: '#fda4af' },
      Badge:   { fill: '#fce7f3', text: '#9d174d', border: '#f9a8d4' },
      Divider: { fill: 'transparent', text: '#fda4af', border: '#fecdd3' },
    },
  },
  dark: {
    mood: 'dark',
    surface:   '#0f172a',
    text:      '#e2e8f0',
    accent:    '#818cf8',
    bg:        '#0f172a',
    radius:    12,
    shadow:    true,
    fontStyle: 'normal',
    sliderDecoration: 'none',
    perType: {
      Button:  { fill: '#4f46e5', text: '#ffffff', border: '#4338ca' },
      Card:    { fill: '#1e293b', text: '#e2e8f0', border: '#334155' },
      Slider:  { fill: '#0284c7', text: '#e0f2fe', border: '#0369a1' },
      Input:   { fill: '#1e293b', text: '#e2e8f0', border: '#475569' },
      Badge:   { fill: '#312e81', text: '#c7d2fe', border: '#4338ca' },
      Divider: { fill: 'transparent', text: '#475569', border: '#1e293b' },
    },
  },
  neon: {
    mood: 'neon',
    surface:   '#030712',
    text:      '#f0fdf4',
    accent:    '#4ade80',
    bg:        '#030712',
    radius:    8,
    shadow:    true,
    fontStyle: 'normal',
    sliderDecoration: 'none',
    perType: {
      Button:  { fill: 'transparent', text: '#4ade80', border: '#4ade80' },
      Card:    { fill: '#042f2e',     text: '#f0fdf4', border: '#4ade80' },
      Slider:  { fill: 'transparent', text: '#22d3ee', border: '#22d3ee' },
      Input:   { fill: '#042f2e',     text: '#f0fdf4', border: '#4ade80' },
      Badge:   { fill: 'transparent', text: '#f0abfc', border: '#f0abfc' },
      Divider: { fill: 'transparent', text: '#4ade80', border: '#4ade80' },
    },
  },
  corporate: {
    mood: 'corporate',
    surface:   '#f8fafc',
    text:      '#0f172a',
    accent:    '#1d4ed8',
    bg:        '#f1f5f9',
    radius:    6,
    shadow:    false,
    fontStyle: 'normal',
    sliderDecoration: 'none',
    perType: {
      Button:  { fill: '#1d4ed8', text: '#ffffff', border: '#1e40af' },
      Card:    { fill: '#ffffff', text: '#0f172a', border: '#e2e8f0' },
      Slider:  { fill: '#3b82f6', text: '#1e3a8a', border: '#2563eb' },
      Input:   { fill: '#ffffff', text: '#0f172a', border: '#cbd5e1' },
      Badge:   { fill: '#eff6ff', text: '#1e40af', border: '#bfdbfe' },
      Divider: { fill: 'transparent', text: '#94a3b8', border: '#e2e8f0' },
    },
  },
  warm: {
    mood: 'warm',
    surface:   '#fffbeb',
    text:      '#451a03',
    accent:    '#d97706',
    bg:        '#fef9ee',
    radius:    14,
    shadow:    true,
    fontStyle: 'normal',
    sliderDecoration: 'none',
    perType: {
      Button:  { fill: '#d97706', text: '#ffffff', border: '#b45309' },
      Card:    { fill: '#fffbeb', text: '#451a03', border: '#fde68a' },
      Slider:  { fill: '#78350f', text: '#ffffff', border: '#92400e' },
      Input:   { fill: '#ffffff', text: '#451a03', border: '#fcd34d' },
      Badge:   { fill: '#fef3c7', text: '#78350f', border: '#fde68a' },
      Divider: { fill: 'transparent', text: '#d97706', border: '#fde68a' },
    },
  },

  // ── Two new profiles added in v2 ─────────────────────────────────────────

  premium: {
    mood: 'premium',
    surface:   '#0d0f14',
    text:      '#e8e4d8',
    accent:    '#c9a96e',
    bg:        '#0d0f14',
    radius:    6,
    shadow:    true,
    fontStyle: 'normal',
    sliderDecoration: 'none',
    perType: {
      Button:  { fill: '#c9a96e', text: '#0d0f14', border: '#9e7a42' },
      Card:    { fill: '#161920', text: '#e8e4d8', border: '#2a2d36' },
      Slider:  { fill: '#161920', text: '#c9a96e', border: '#c9a96e' },
      Input:   { fill: '#161920', text: '#e8e4d8', border: '#2a2d36' },
      Badge:   { fill: '#22201a', text: '#c9a96e', border: '#9e7a42' },
      Divider: { fill: 'transparent', text: '#3a3628', border: '#2a2d36' },
    },
  },

  electric: {
    mood: 'electric',
    surface:   '#0a0a0a',
    text:      '#f0f0f0',
    accent:    '#1db954',
    bg:        '#0a0a0a',
    radius:    8,
    shadow:    true,
    fontStyle: 'normal',
    sliderDecoration: 'none',
    perType: {
      Button:  { fill: '#1db954', text: '#000000', border: '#17a347' },
      Card:    { fill: '#121212', text: '#f0f0f0', border: '#282828' },
      Slider:  { fill: '#121212', text: '#1db954', border: '#1db954' },
      Input:   { fill: '#121212', text: '#f0f0f0', border: '#282828' },
      Badge:   { fill: '#1a3a27', text: '#1db954', border: '#1db954' },
      Divider: { fill: 'transparent', text: '#282828', border: '#282828' },
    },
  },
}

// ─── Profile resolution via intent engine ─────────────────────────────────────

function pickProfile(prompt) {
  if (!prompt.trim()) return PROFILES.default

  const memory = loadMemory()
  const { profileKey } = interpretIntent(prompt, memory)

  // Map intent engine profile key → our PROFILES keys
  // The intent engine can return 'electric' and 'premium' which exist now
  return PROFILES[profileKey] ?? PROFILES.default
}

function applyProfile(component, profile) {
  const pts = profile.perType ?? {}
  const typeColors = pts[component.type] ?? pts.Button ?? {}
  const base = {
    fill:   typeColors.fill   ?? component.style.fill,
    text:   typeColors.text   ?? component.style.text,
    border: typeColors.border ?? component.style.border,
    radius: component.sourceShape === 'circle' ? 999 : profile.radius,
    shadow: profile.shadow,
  }

  let props = { ...component.props }
  if (component.type === 'Slider' && profile.sliderDecoration === 'heart') {
    props = { ...props, label: props.label.startsWith('💖') ? props.label : `💖 ${props.label}` }
  }
  if (component.type === 'Slider' && profile.sliderDecoration === 'stars') {
    props = { ...props, label: props.label.startsWith('⭐') ? props.label : `⭐ ${props.label}` }
  }

  return { ...component, style: base, props }
}

function buildChangeSummary(components, profile, intentReasoning) {
  if (!components.length) return null
  const mood = profile.mood
  if (mood === 'default') return null

  const typeCounts = {}
  components.forEach(c => { typeCounts[c.type] = (typeCounts[c.type] ?? 0) + 1 })
  const typeList = Object.entries(typeCounts)
    .map(([t, n]) => `${n} ${t}${n > 1 ? 's' : ''}`)
    .join(', ')

  const radiusNote = profile.radius <= 6 ? 'sharp corners' : profile.radius >= 18 ? 'rounded corners' : null
  const shadowNote = profile.shadow ? 'shadows on' : 'shadows off'
  const extras = [radiusNote, shadowNote].filter(Boolean).join(', ')

  // Use the intent engine's reasoning if available (more natural language)
  const prefix = intentReasoning ?? `Applied "${mood}"`

  return `${prefix} · restyled ${typeList}${extras ? ` · ${extras}` : ''}`
}

export function refineComponentsWithPrompt(components, prompt) {
  const profile = pickProfile(prompt.trim())

  // Get intent reasoning for the change summary
  let intentReasoning = null
  if (prompt.trim()) {
    const memory = loadMemory()
    const intent = interpretIntent(prompt.trim(), memory)
    intentReasoning = intent.reasoning
    // Persist this preference to memory
    saveToMemory(profile.mood, prompt.trim())
  }

  const refined = components.map((c) => applyProfile(c, profile))
  const changeSummary = buildChangeSummary(components, profile, intentReasoning)

  return { components: refined, profile, changeSummary }
}
