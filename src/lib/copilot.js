export const PRESETS = [
  { label: '✨ Default',  prompt: '' },
  { label: '⬛ Minimal',  prompt: 'minimal' },
  { label: '🎉 Playful',  prompt: 'playful' },
  { label: '💖 Romantic', prompt: 'soft colors romantic vibe' },
  { label: '🌙 Dark',     prompt: 'dark mode' },
  { label: '⚡ Neon',     prompt: 'neon cyberpunk' },
  { label: '🏢 Corporate',prompt: 'corporate professional' },
  { label: '🌅 Warm',     prompt: 'warm earthy colors' },
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
}

function pickProfile(prompt) {
  const p = prompt.toLowerCase()
  if (!p) return PROFILES.default
  if (p.includes('minimal') || p.includes('clean') || p.includes('simple')) return PROFILES.minimal
  if (p.includes('playful') || p.includes('fun') || p.includes('colorful'))  return PROFILES.playful
  if (p.includes('romantic') || p.includes('soft') || p.includes('heart') || p.includes('love')) return PROFILES.soft
  if (p.includes('dark') || p.includes('night') || p.includes('black'))      return PROFILES.dark
  if (p.includes('neon') || p.includes('cyber') || p.includes('glow'))       return PROFILES.neon
  if (p.includes('corporate') || p.includes('professional') || p.includes('business')) return PROFILES.corporate
  if (p.includes('warm') || p.includes('earthy') || p.includes('cozy'))      return PROFILES.warm
  return PROFILES.default
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

export function refineComponentsWithPrompt(components, prompt) {
  const profile = pickProfile(prompt.trim())
  return {
    components: components.map((c) => applyProfile(c, profile)),
    profile,
  }
}
