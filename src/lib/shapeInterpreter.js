function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value))
}

function aspectRatio(w, h) {
  return w / Math.max(1, h)
}

export function defaultsForType(type, index) {
  const i = index + 1
  if (type === 'Slider')  return { label: `Range ${i}`, value: 50, min: 0, max: 100 }
  if (type === 'Card')    return { title: `Card ${i}`, body: 'Your content here' }
  if (type === 'Input')   return { placeholder: 'Enter text...' }
  if (type === 'Badge')   return { label: `${i}` }
  if (type === 'Divider') return { label: '' }
  if (type === 'Nav')     return { brand: 'MyApp', links: ['Home', 'Features', 'Pricing', 'Docs'] }
  if (type === 'Hero')    return { headline: 'Build Amazing UIs', subhead: 'Fast. Flexible. Beautiful.', cta: 'Get Started' }
  if (type === 'Section') return { heading: 'Features', body: 'Describe what makes this section special.' }
  if (type === 'VisualClone') return { imageUrl: '', fit: 'contain' }
  if (type === 'SemanticNode') return { role: 'Static container', htmlTag: 'div', label: 'Element' }
  return { label: `Button ${i}` }
}

const TYPE_STYLES = {
  Button:  { fill: '#2563eb', text: '#ffffff', border: '#1d4ed8', radius: 12, shadow: true },
  Card:    { fill: '#ffffff', text: '#0f172a', border: '#e2e8f0', radius: 16, shadow: true },
  Slider:  { fill: '#e0f2fe', text: '#075985', border: '#0284c7', radius: 10, shadow: false },
  Input:   { fill: '#f8fafc', text: '#334155', border: '#cbd5e1', radius: 12, shadow: false },
  Badge:   { fill: '#eff6ff', text: '#1e3a8a', border: '#93c5fd', radius: 999, shadow: false },
  Divider: { fill: 'transparent', text: '#94a3b8', border: '#e2e8f0', radius: 0, shadow: false },
  Nav:     { fill: '#1e293b', text: '#f8fafc', border: '#334155', radius: 0, shadow: true },
  Hero:    { fill: '#6d28d9', text: '#ffffff', border: '#7c3aed', radius: 0, shadow: true },
  Section: { fill: '#f0fdfa', text: '#134e4a', border: '#99f6e4', radius: 12, shadow: false },
  VisualClone: { fill: 'transparent', text: '#0f172a', border: 'transparent', radius: 0, shadow: false },
  SemanticNode: { fill: 'transparent', text: 'transparent', border: 'transparent', radius: 0, shadow: false },
}

function inferShapeFamily(object) {
  const { shape, width = 1, height = 1 } = object
  const ar = aspectRatio(width, height)

  if (shape === 'line') return 'stroke'
  if (shape === 'circle') return 'round'
  if (shape === 'rect') return ar > 2.4 ? 'wide' : ar < 0.7 ? 'tall' : 'block'
  if (shape === 'path') {
    if (ar > 4.5) return 'wave'
    if (ar > 2.2) return 'wide'
    if (ar < 0.8) return 'tall'
    return 'organic'
  }
  return 'organic'
}

function inferSymbolSet(object) {
  const family = inferShapeFamily(object)

  if (family === 'stroke') {
    return [
      { name: 'Arrow', glyph: '➜' },
      { name: 'Minus', glyph: '−' },
      { name: 'Wave', glyph: '∿' },
      { name: 'Checkmark', glyph: '✓' },
    ]
  }

  if (family === 'round') {
    return [
      { name: 'Circle', glyph: '◉' },
      { name: 'Heart', glyph: '♥' },
      { name: 'Star', glyph: '★' },
      { name: 'Play', glyph: '▶' },
    ]
  }

  if (family === 'wide') {
    return [
      { name: 'Arrow', glyph: '➜' },
      { name: 'Wave', glyph: '∿' },
      { name: 'Plus', glyph: '+' },
      { name: 'Highlight', glyph: '▭' },
    ]
  }

  if (family === 'tall') {
    return [
      { name: 'Pause', glyph: '⏸' },
      { name: 'Cross', glyph: '✕' },
      { name: 'Status Mark', glyph: '◆' },
      { name: 'Accent Pillar', glyph: '▮' },
    ]
  }

  return [
    { name: 'Heart', glyph: '♥' },
    { name: 'Star', glyph: '★' },
    { name: 'Scribble', glyph: '〰' },
    { name: 'Blob', glyph: '⬭' },
  ]
}

const UI_ROLE_VARIANTS = [
  {
    id: 'ui-button',
    label: 'Button shape',
    role: 'Primary action',
    componentType: 'Button',
    props: ({ glyph }) => ({ label: `${glyph} Action` }),
  },
  {
    id: 'ui-icon-button',
    label: 'Icon inside button',
    role: 'Icon trigger',
    componentType: 'Button',
    props: ({ glyph }) => ({ label: `${glyph}` }),
    widthScale: 0.7,
  },
  {
    id: 'ui-slider-handle',
    label: 'Slider handle',
    role: 'Fine control',
    componentType: 'Slider',
    props: ({ name }) => ({ label: `${name} level`, value: 58, min: 0, max: 100 }),
  },
  {
    id: 'ui-toggle-knob',
    label: 'Toggle knob',
    role: 'On/off state',
    componentType: 'Badge',
    props: ({ glyph }) => ({ label: `${glyph} ON` }),
    style: { fill: '#dcfce7', text: '#166534', border: '#86efac' },
  },
  {
    id: 'ui-rating',
    label: 'Rating icon',
    role: 'Feedback value',
    componentType: 'Badge',
    props: ({ glyph }) => ({ label: `${glyph} 4.8` }),
    style: { fill: '#fef3c7', text: '#92400e', border: '#fcd34d' },
  },
  {
    id: 'ui-progress',
    label: 'Progress indicator',
    role: 'Completion state',
    componentType: 'Slider',
    props: ({ name }) => ({ label: `${name} progress`, value: 72, min: 0, max: 100 }),
  },
]

const DECORATIVE_VARIANTS = [
  {
    id: 'decor-bg',
    label: 'Background decoration',
    role: 'Backdrop accent',
    componentType: 'Card',
    props: ({ name }) => ({ title: `${name} texture`, body: 'Soft atmospheric decoration' }),
    style: { fill: '#f8fafc', text: '#64748b', border: '#e2e8f0', shadow: false },
  },
  {
    id: 'decor-sticker',
    label: 'Overlay sticker',
    role: 'Spotlight detail',
    componentType: 'Badge',
    props: ({ glyph }) => ({ label: `${glyph} NEW` }),
    style: { fill: '#f0f9ff', text: '#0369a1', border: '#7dd3fc' },
  },
  {
    id: 'decor-divider',
    label: 'Decorative divider',
    role: 'Section separator',
    componentType: 'Divider',
    props: () => ({ label: '' }),
  },
  {
    id: 'decor-highlight',
    label: 'Highlight sweep',
    role: 'Text emphasis',
    componentType: 'Input',
    props: ({ name }) => ({ placeholder: `${name} highlight` }),
    style: { fill: '#fff7ed', text: '#9a3412', border: '#fdba74' },
  },
]

const MEANING_VARIANTS = [
  {
    id: 'meaning-love',
    label: 'Love / like',
    role: 'Emotion signal',
    componentType: 'Badge',
    glyph: '♥',
    props: () => ({ label: '♥ Like' }),
    style: { fill: '#ffe4e6', text: '#be123c', border: '#fda4af' },
  },
  {
    id: 'meaning-favorite',
    label: 'Favorite',
    role: 'Preference marker',
    componentType: 'Badge',
    glyph: '★',
    props: () => ({ label: '★ Favorite' }),
    style: { fill: '#fef3c7', text: '#92400e', border: '#fcd34d' },
  },
  {
    id: 'meaning-warning',
    label: 'Warning',
    role: 'Alert state',
    componentType: 'Badge',
    glyph: '⚠',
    props: () => ({ label: '⚠ Warning' }),
    style: { fill: '#fff7ed', text: '#c2410c', border: '#fdba74' },
  },
  {
    id: 'meaning-success',
    label: 'Success',
    role: 'Positive state',
    componentType: 'Badge',
    glyph: '✓',
    props: () => ({ label: '✓ Success' }),
    style: { fill: '#ecfdf5', text: '#166534', border: '#86efac' },
  },
]

function buildSuggestion({
  id,
  category,
  categoryLabel,
  categoryIcon,
  label,
  role,
  componentType,
  symbol,
  kind = 'component',
  propsPatch,
  stylePatch,
  widthScale,
  heightScale,
}) {
  return {
    id,
    kind,
    category,
    categoryLabel,
    categoryIcon,
    label,
    role,
    componentType,
    symbol,
    propsPatch,
    stylePatch,
    widthScale,
    heightScale,
  }
}

export function getSketchSuggestions(object, { overlapsComponent = false } = {}) {
  const symbols = inferSymbolSet(object)
  const suggestions = []

  symbols.forEach((symbolItem, index) => {
    suggestions.push(buildSuggestion({
      id: `shape-${index}-${symbolItem.name}`,
      category: 'shape',
      categoryLabel: 'Shape & Icon',
      categoryIcon: '◇',
      label: `${symbolItem.name} Icon`,
      role: 'Visual symbol',
      componentType: 'Badge',
      symbol: symbolItem.glyph,
      propsPatch: { label: symbolItem.glyph },
      stylePatch: { fill: '#f8fafc', text: '#334155', border: '#cbd5e1' },
      widthScale: 0.85,
    }))
  })

  UI_ROLE_VARIANTS.forEach((variant) => {
    const symbolItem = symbols[0]
    suggestions.push(buildSuggestion({
      id: variant.id,
      category: 'ui',
      categoryLabel: 'UI Function',
      categoryIcon: '▣',
      label: variant.label,
      role: variant.role,
      componentType: variant.componentType,
      symbol: symbolItem.glyph,
      propsPatch: variant.props(symbolItem),
      stylePatch: variant.style,
      widthScale: variant.widthScale,
      heightScale: variant.heightScale,
    }))
  })

  DECORATIVE_VARIANTS.forEach((variant) => {
    const symbolItem = symbols[1] ?? symbols[0]
    suggestions.push(buildSuggestion({
      id: variant.id,
      category: 'decor',
      categoryLabel: 'Decorative Use',
      categoryIcon: '✧',
      label: variant.label,
      role: variant.role,
      componentType: variant.componentType,
      symbol: symbolItem.glyph,
      propsPatch: variant.props(symbolItem),
      stylePatch: variant.style,
    }))
  })

  MEANING_VARIANTS.forEach((variant) => {
    suggestions.push(buildSuggestion({
      id: variant.id,
      category: 'meaning',
      categoryLabel: 'Metaphor & Meaning',
      categoryIcon: '☼',
      label: variant.label,
      role: variant.role,
      componentType: variant.componentType,
      symbol: variant.glyph,
      propsPatch: variant.props(),
      stylePatch: variant.style,
      widthScale: 1.05,
    }))
  })

  if (overlapsComponent) {
    suggestions.push(buildSuggestion({
      id: 'decor-attach',
      category: 'decor',
      categoryLabel: 'Decorative Use',
      categoryIcon: '✧',
      label: 'Apply to this component',
      role: 'Attached ornament',
      componentType: 'Badge',
      symbol: symbols[0].glyph,
      kind: 'attach',
      propsPatch: { label: symbols[0].glyph },
      stylePatch: { fill: '#eef2ff', text: '#4338ca', border: '#a5b4fc' },
      widthScale: 0.85,
    }))
  }

  suggestions.push(buildSuggestion({
    id: 'keep-drawing',
    category: 'drawing',
    categoryLabel: 'Pure Drawing',
    categoryIcon: '✎',
    label: 'Keep as drawing',
    role: 'No conversion',
    componentType: null,
    kind: 'keep',
    symbol: symbols[0].glyph,
  }))

  suggestions.push(buildSuggestion({
    id: 'decorative-only',
    category: 'drawing',
    categoryLabel: 'Pure Drawing',
    categoryIcon: '✎',
    label: 'Decorative only',
    role: 'Keep visual mark',
    componentType: null,
    kind: 'keep',
    symbol: symbols[1]?.glyph ?? symbols[0].glyph,
  }))

  return suggestions.slice(0, 20)
}

export function createComponentFromSketch(object, type, index = 0) {
  const baseStyle = TYPE_STYLES[type] ?? TYPE_STYLES.Button
  return {
    id: object.id,
    type,
    x: clamp(Math.round(object.x), 0, 700),
    y: clamp(Math.round(object.y), 0, 450),
    width: clamp(Math.round(object.width), 50, 360),
    height: clamp(Math.round(object.height), 20, 240),
    props: defaultsForType(type, index),
    style: {
      ...baseStyle,
      radius: object.shape === 'circle' ? 999 : baseStyle.radius,
    },
    sourceShape: object.shape,
    source: 'drawn',
  }
}

export function interpretSketchObjects(sketchObjects) {
  return sketchObjects.map((object, index) => {
    const suggestion = getSketchSuggestions(object)[0]
    const type = suggestion?.componentType ?? 'Button'
    return createComponentFromSketch(object, type, index)
  })
}
