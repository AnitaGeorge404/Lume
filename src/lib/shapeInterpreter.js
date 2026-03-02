function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value))
}

// How "elongated" is a shape? Used to catch horizontal sliders
function aspectRatio(w, h) {
  return w / Math.max(1, h)
}

function unique(values) {
  return [...new Set(values)]
}

function candidateTypesForObject(object) {
  const { shape, width = 1, height = 1 } = object
  const ar = aspectRatio(width, height)
  const area = width * height

  if (shape === 'line') {
    const dx = Math.abs((object.x2 ?? 0) - (object.x1 ?? 0))
    const dy = Math.abs((object.y2 ?? 0) - (object.y1 ?? 0))
    if (dx > dy * 2.5 && dx > 60) return ['Slider', 'Divider']
    return ['Divider', 'Slider']
  }

  if (shape === 'circle') {
    const r = object.radius ?? width / 2
    if (r < 24) return ['Badge', 'Button']
    if (r < 56) return ['Button', 'Badge', 'Card']
    return ['Card', 'Button']
  }

  if (shape === 'rect') {
    if (width > 240 && height > 130) return ['Card', 'Input']
    if (ar > 4 && height < 44) return ['Slider', 'Divider', 'Input']
    if (ar > 2 && height < 62) return ['Input', 'Button', 'Slider']
    if (ar > 1.2 && height < 78) return ['Button', 'Input']
    if (width > 150 && height > 90) return ['Card', 'Button']
    return ['Button', 'Badge']
  }

  if (shape === 'path') {
    if (ar > 4.5 && height < 40) return ['Slider', 'Divider', 'Input']
    if (area > 26000 && ar > 0.5 && ar < 3.5) return ['Card', 'Button']
    if (ar > 2.6 && height < 72 && width > 90) return ['Input', 'Button']
    if (area < 7000) return ['Badge', 'Button', 'Divider']
    return ['Button', 'Badge', 'Card']
  }

  return ['Button']
}

function isLowConfidence(object, candidates) {
  const { shape, width = 1, height = 1 } = object
  if (shape === 'path') {
    const ar = aspectRatio(width, height)
    return ar < 1.15 && ar > 0.85 && width < 90 && height < 90
  }
  return candidates.length <= 1
}

export function defaultsForType(type, index) {
  const i = index + 1
  if (type === 'Slider') return { label: `Range ${i}`, value: 50, min: 0, max: 100 }
  if (type === 'Card')   return { title: `Card ${i}`, body: 'Your content here' }
  if (type === 'Input')  return { placeholder: `Enter text...` }
  if (type === 'Badge')  return { label: `${i}` }
  if (type === 'Divider') return { label: '' }
  return { label: `Button ${i}` }
}

const TYPE_STYLES = {
  Button:  { fill: '#2563eb', text: '#ffffff', border: '#1d4ed8', radius: 12, shadow: true },
  Card:    { fill: '#ffffff', text: '#0f172a', border: '#e2e8f0', radius: 16, shadow: true },
  Slider:  { fill: '#e0f2fe', text: '#075985', border: '#0284c7', radius: 10, shadow: false },
  Input:   { fill: '#f8fafc', text: '#334155', border: '#cbd5e1', radius: 12, shadow: false },
  Badge:   { fill: '#eff6ff', text: '#1e3a8a', border: '#93c5fd', radius: 999, shadow: false },
  Divider: { fill: 'transparent', text: '#94a3b8', border: '#e2e8f0', radius: 0, shadow: false },
}

export function getSketchSuggestions(object, { overlapsComponent = false } = {}) {
  const base = candidateTypesForObject(object)
  const lowConfidence = isLowConfidence(object, base)
  const limited = lowConfidence ? base.slice(0, 2) : base.slice(0, 4)

  const suggestions = unique(limited).map(type => ({
    id: `type-${type}`,
    kind: 'component',
    type,
    label: type,
  }))

  if (overlapsComponent) {
    suggestions.push({
      id: 'attach-decor',
      kind: 'attach',
      type: 'Badge',
      label: 'Attach Decor',
    })
  }

  suggestions.push({
    id: 'keep-drawing',
    kind: 'keep',
    type: null,
    label: 'Keep Drawing',
  })

  return suggestions
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
    const type = candidateTypesForObject(object)[0] ?? 'Button'
    return createComponentFromSketch(object, type, index)
  })
}
