function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value))
}

// How "elongated" is a shape? Used to catch horizontal sliders
function aspectRatio(w, h) {
  return w / Math.max(1, h)
}

// Compactness: a perfect circle = 1, very elongated = 0. Helps distinguish round freehand vs wide blobs.
function detectComponentType(object) {
  const { shape, width = 1, height = 1 } = object

  // ── Drawn Lines ──────────────────────────────────────────────
  if (shape === 'line') {
    const dx = Math.abs((object.x2 ?? 0) - (object.x1 ?? 0))
    const dy = Math.abs((object.y2 ?? 0) - (object.y1 ?? 0))
    if (dx > dy * 2.5 && dx > 60) return 'Slider'
    return 'Divider'
  }

  // ── Tool Circles ─────────────────────────────────────────────
  if (shape === 'circle') {
    const r = object.radius ?? width / 2
    if (r < 35) return 'Badge'
    return 'Button'
  }

  // ── Tool Rectangles ──────────────────────────────────────────
  if (shape === 'rect') {
    const ar = aspectRatio(width, height)
    if (width > 240 && height > 130) return 'Card'
    if (ar > 3.5 && height < 55) return 'Slider'
    if (ar > 1.5 && height < 55) return 'Input'
    if (ar > 1.2 && height < 75) return 'Button'
    if (width > 160 && height > 100) return 'Card'
    return 'Button'
  }

  // ── Freehand Paths ───────────────────────────────────────────
  if (shape === 'path') {
    const ar = aspectRatio(width, height)
    const area = width * height

    // Very wide, flat → Slider
    if (ar > 4.5 && height < 40) return 'Slider'
    // Tallest + widest blobs → Card (needs real estate)
    if (area > 28000 && ar > 0.5 && ar < 3.5) return 'Card'
    // Wide & moderate height → Input
    if (ar > 2.8 && height < 70 && width > 90) return 'Input'
    // Small-ish, mostly squarish → Button
    if (area < 8000) return 'Button'
    // Wide but not huge → Button
    return 'Button'
  }

  return 'Button'
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
  Button:  { fill: '#6366f1', text: '#ffffff', border: '#4f46e5', radius: 12, shadow: true },
  Card:    { fill: '#ffffff', text: '#111827', border: '#e2e8f0', radius: 16, shadow: true },
  Slider:  { fill: '#0ea5e9', text: '#0c4a6e', border: '#0284c7', radius: 8,  shadow: false },
  Input:   { fill: '#f8fafc', text: '#334155', border: '#94a3b8', radius: 10, shadow: false },
  Badge:   { fill: '#f0fdf4', text: '#15803d', border: '#86efac', radius: 999, shadow: false },
  Divider: { fill: 'transparent', text: '#94a3b8', border: '#e2e8f0', radius: 0, shadow: false },
}

export function interpretSketchObjects(sketchObjects) {
  return sketchObjects.map((object, index) => {
    const type = detectComponentType(object)
    const baseStyle = TYPE_STYLES[type] ?? TYPE_STYLES.Button

    return {
      id: object.id,
      type,
      x: clamp(Math.round(object.x), 0, 700),
      y: clamp(Math.round(object.y), 0, 450),
      width:  clamp(Math.round(object.width),  50, 360),
      height: clamp(Math.round(object.height), 20, 240),
      props: defaultsForType(type, index),
      style: {
        ...baseStyle,
        // circles keep pill radius regardless of default
        radius: object.shape === 'circle' ? 999 : baseStyle.radius,
      },
      sourceShape: object.shape,
    }
  })
}
