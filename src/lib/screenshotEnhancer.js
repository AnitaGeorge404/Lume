const CANVAS_W = 760
const CANVAS_H = 480

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value))
}

function quantize(value, step = 8) {
  return Math.round(value / step) * step
}

function toRgb(hex) {
  const normalized = String(hex ?? '').replace('#', '')
  const expanded = normalized.length === 3
    ? normalized.split('').map((token) => token + token).join('')
    : normalized
  const n = Number.parseInt(expanded || '2563eb', 16)
  return {
    r: (n >> 16) & 255,
    g: (n >> 8) & 255,
    b: n & 255,
  }
}

function tint(hex, amount = 0.18) {
  const { r, g, b } = toRgb(hex)
  const mix = (v) => Math.round(v + (255 - v) * amount)
  return `rgb(${mix(r)}, ${mix(g)}, ${mix(b)})`
}

function stylePreset(kind, palette) {
  const light = {
    button: { fill: palette.accent, text: '#ffffff', border: palette.accentDark, radius: 12, shadow: true },
    buttonGhost: { fill: '#ffffff', text: palette.accentDark, border: '#d5e1f4', radius: 12, shadow: false },
    card: { fill: '#ffffff', text: '#0f172a', border: 'transparent', radius: 16, shadow: true },
    cardSoft: { fill: palette.surfaceAlt, text: '#0f172a', border: 'transparent', radius: 14, shadow: false },
    input: { fill: '#f8fafc', text: '#334155', border: '#d1dbe9', radius: 12, shadow: false },
    slider: { fill: palette.softAccent, text: palette.accentDark, border: palette.accent, radius: 10, shadow: false },
    badge: { fill: palette.softAccent, text: palette.accentDark, border: palette.accent, radius: 999, shadow: false },
    divider: { fill: 'transparent', text: '#94a3b8', border: '#e2e8f0', radius: 0, shadow: false },
  }

  if (kind !== 'dark') return light

  return {
    ...light,
    card: { fill: '#101827', text: '#e2e8f0', border: '#1f2a3b', radius: 16, shadow: true },
    cardSoft: { fill: '#1a2636', text: '#dce7f5', border: '#28364a', radius: 14, shadow: false },
    input: { fill: '#111c2b', text: '#dce7f5', border: '#334257', radius: 12, shadow: false },
    buttonGhost: { fill: '#1a2636', text: '#c7d2fe', border: '#3b4c64', radius: 12, shadow: false },
    divider: { fill: 'transparent', text: '#94a3b8', border: '#2f3f56', radius: 0, shadow: false },
  }
}

function c(id, type, x, y, width, height, style, props) {
  return {
    id,
    type,
    x: clamp(quantize(x), 0, 700),
    y: clamp(quantize(y), 0, 450),
    width: clamp(quantize(width), 50, 720),
    height: clamp(quantize(height), 20, 420),
    style,
    props,
    sourceShape: `screenshot_${type.toLowerCase()}`,
    source: 'template',
  }
}

export function analyzeScreenshotMeta(meta) {
  const ratio = meta.width / Math.max(1, meta.height)
  const isWide = ratio > 1.4
  const isTall = ratio < 0.9
  const density = meta.fileSize > 900000 ? 'high' : meta.fileSize > 350000 ? 'medium' : 'low'

  const layout = isWide
    ? (density === 'high' ? 'dashboard' : 'landing')
    : isTall
      ? 'mobile'
      : 'content'

  const brightness = meta.avgLuma ?? 0.78
  const tone = brightness < 0.42 ? 'dark' : 'light'

  return {
    layout,
    density,
    tone,
    ratio,
    width: meta.width,
    height: meta.height,
    dominant: meta.dominant ?? '#2563eb',
    dominantDark: meta.dominantDark ?? '#1d4ed8',
  }
}

export function reconstructFromScreenshotAnalysis(analysis) {
  const palette = {
    accent: analysis.dominant,
    accentDark: analysis.dominantDark,
    border: '#dbe4f0',
    surfaceAlt: analysis.tone === 'dark' ? '#1a2636' : '#f7fafd',
    softAccent: tint(analysis.dominant, analysis.tone === 'dark' ? 0.08 : 0.82),
  }
  const styles = stylePreset(analysis.tone, palette)

  if (analysis.layout === 'dashboard') {
    return [
      c('ss-nav', 'Card', 20, 16, 720, 62, styles.card, { title: 'Operations Dashboard', body: 'Overview • Pipeline • Team • Settings' }),
      c('ss-badge', 'Badge', 38, 34, 84, 28, styles.badge, { label: 'LIVE' }),
      c('ss-kpi-a', 'Card', 20, 94, 230, 122, styles.card, { title: 'Revenue', body: '$184,200' }),
      c('ss-kpi-b', 'Card', 265, 94, 230, 122, styles.card, { title: 'Active Users', body: '24,980' }),
      c('ss-kpi-c', 'Card', 510, 94, 230, 122, styles.card, { title: 'Conversion', body: '5.9%' }),
      c('ss-s1', 'Slider', 20, 236, 474, 44, styles.slider, { label: 'Forecast confidence', value: 71, min: 0, max: 100 }),
      c('ss-search', 'Input', 20, 294, 474, 46, styles.input, { placeholder: 'Search projects and reports…' }),
      c('ss-cta', 'Button', 510, 294, 230, 46, styles.button, { label: 'Create report' }),
      c('ss-div', 'Divider', 20, 354, 720, 2, styles.divider, { label: '' }),
      c('ss-list', 'Card', 20, 370, 720, 90, styles.cardSoft, { title: 'Recent activity', body: '8 updates from product and design today.' }),
    ]
  }

  if (analysis.layout === 'mobile') {
    return [
      c('ss-m-header', 'Card', 202, 16, 356, 68, styles.card, { title: 'Welcome back', body: 'Continue setup in one minute' }),
      c('ss-m-card', 'Card', 202, 96, 356, 162, styles.card, { title: 'Complete your profile', body: 'Add a few details to personalize your workspace.' }),
      c('ss-m-i1', 'Input', 220, 276, 320, 44, styles.input, { placeholder: 'Email address' }),
      c('ss-m-i2', 'Input', 220, 332, 320, 44, styles.input, { placeholder: 'Phone number' }),
      c('ss-m-btn', 'Button', 220, 392, 320, 46, styles.button, { label: 'Continue' }),
    ]
  }

  if (analysis.layout === 'content') {
    return [
      c('ss-c-nav', 'Card', 20, 18, 720, 58, styles.card, { title: 'Studio Site', body: 'Work • Services • Testimonials • Contact' }),
      c('ss-c-hero', 'Card', 20, 92, 470, 214, styles.card, { title: 'Design systems that scale cleanly', body: 'Build, refine, and ship with a consistent visual foundation.' }),
      c('ss-c-side', 'Card', 510, 92, 230, 214, styles.cardSoft, { title: 'Highlights', body: 'Case studies, proof points, and social proof.' }),
      c('ss-c-cta1', 'Button', 44, 252, 150, 42, styles.button, { label: 'Start project' }),
      c('ss-c-cta2', 'Button', 206, 252, 150, 42, styles.buttonGhost, { label: 'View work' }),
      c('ss-c-div', 'Divider', 20, 328, 720, 2, styles.divider, { label: '' }),
      c('ss-c-f1', 'Card', 20, 346, 230, 114, styles.cardSoft, { title: 'Fast setup', body: 'From screenshot to clean UI quickly.' }),
      c('ss-c-f2', 'Card', 265, 346, 230, 114, styles.cardSoft, { title: 'Modern style', body: 'Components that feel current and usable.' }),
      c('ss-c-f3', 'Card', 510, 346, 230, 114, styles.cardSoft, { title: 'Code ready', body: 'Export JSX and CSS directly.' }),
    ]
  }

  return [
    c('ss-l-nav', 'Card', 20, 18, 720, 58, styles.card, { title: 'Product Site', body: 'Home • Features • Pricing • Docs' }),
    c('ss-l-badge', 'Badge', 34, 34, 92, 28, styles.badge, { label: 'NEW' }),
    c('ss-l-hero', 'Card', 20, 92, 720, 166, styles.card, { title: 'Rebuild and enhance any UI screenshot', body: 'Screenshot intent is translated into a cleaner, production-style layout.' }),
    c('ss-l-input', 'Input', 46, 276, 446, 46, styles.input, { placeholder: 'Work email' }),
    c('ss-l-btn', 'Button', 510, 276, 210, 46, styles.button, { label: 'Get started' }),
    c('ss-l-div', 'Divider', 20, 340, 720, 2, styles.divider, { label: '' }),
    c('ss-l-c1', 'Card', 20, 358, 230, 102, styles.cardSoft, { title: 'Smart analysis', body: 'Infers hierarchy and intent.' }),
    c('ss-l-c2', 'Card', 265, 358, 230, 102, styles.cardSoft, { title: 'Visual polish', body: 'Normalizes spacing and alignment.' }),
    c('ss-l-c3', 'Card', 510, 358, 230, 102, styles.cardSoft, { title: 'Editable output', body: 'Ready for drawing and AI refinement.' }),
  ]
}

export function enhanceReconstructedComponents(components) {
  const polished = components
    .map((component) => {
      const width = quantize(component.width)
      const height = quantize(component.height)
      const x = clamp(quantize(component.x), 0, CANVAS_W - 40)
      const y = clamp(quantize(component.y), 0, CANVAS_H - 24)

      if (component.type === 'Button') {
        return {
          ...component,
          x,
          y,
          width: clamp(Math.max(136, width), 96, 340),
          height: clamp(Math.max(42, height), 40, 58),
          style: { ...component.style, radius: 12, shadow: true },
        }
      }

      if (component.type === 'Input') {
        return {
          ...component,
          x,
          y,
          width: clamp(Math.max(220, width), 180, 580),
          height: clamp(Math.max(44, height), 40, 58),
          style: { ...component.style, radius: 12, border: component.style.border ?? '#d1dbe9' },
        }
      }

      if (component.type === 'Card') {
        return {
          ...component,
          x,
          y,
          width: clamp(width, 180, 720),
          height: clamp(height, 74, 320),
          style: { ...component.style, radius: 16, shadow: true },
        }
      }

      if (component.type === 'Badge') {
        return {
          ...component,
          x,
          y,
          width: clamp(Math.max(68, width), 56, 220),
          height: clamp(Math.max(28, height), 24, 52),
        }
      }

      return {
        ...component,
        x,
        y,
        width,
        height,
      }
    })
    .sort((a, b) => a.y - b.y || a.x - b.x)

  const rows = []
  for (const component of polished) {
    const row = rows.find((entry) => Math.abs(entry.anchorY - component.y) <= 22)
    if (row) {
      row.items.push(component)
      row.anchorY = Math.round((row.anchorY + component.y) / 2)
    } else {
      rows.push({ anchorY: component.y, items: [component] })
    }
  }

  rows.forEach((row) => {
    const normalizedY = quantize(row.anchorY)
    row.items
      .sort((a, b) => a.x - b.x)
      .forEach((component, index) => {
        component.y = normalizedY
        if (index > 0) {
          const previous = row.items[index - 1]
          const minGap = previous.type === 'Divider' ? 10 : 14
          const minX = quantize(previous.x + previous.width + minGap)
          if (component.x < minX) component.x = minX
        }
      })
  })

  return polished
}

export function renderComparisonPreviewSvg(components) {
  const sx = 320 / CANVAS_W
  const sy = 200 / CANVAS_H
  const escape = (value) => String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')

  const blocks = components.slice(0, 20).map((component) => {
    const x = Math.round(component.x * sx)
    const y = Math.round(component.y * sy)
    const width = Math.max(8, Math.round(component.width * sx))
    const rawHeight = Math.max(4, Math.round(component.height * sy))
    const height = component.type === 'Divider' ? 2 : rawHeight
    const radius = component.type === 'Badge'
      ? 999
      : Math.max(3, Math.round((component.style?.radius ?? 10) * 0.4))
    const fill = component.style?.fill ?? '#ffffff'
    const border = component.style?.border ?? 'transparent'

    if (component.type === 'Divider') {
      return `<rect x="${x}" y="${y}" width="${width}" height="2" rx="1" fill="${border}" opacity="0.55"/>`
    }

    if (component.type === 'Button') {
      const label = escape(component.props?.label ?? 'Action')
      return `
        <g>
          <rect x="${x}" y="${y}" width="${width}" height="${height}" rx="${radius}" fill="${fill}"/>
          <text x="${x + Math.round(width / 2)}" y="${y + Math.round(height * 0.62)}" text-anchor="middle" font-size="8" font-weight="700" fill="#ffffff">${label}</text>
        </g>
      `
    }

    if (component.type === 'Input') {
      const placeholder = escape(component.props?.placeholder ?? 'Search…')
      return `
        <g>
          <rect x="${x}" y="${y}" width="${width}" height="${height}" rx="${radius}" fill="${fill}" stroke="${border}" stroke-width="1"/>
          <text x="${x + 8}" y="${y + Math.round(height * 0.6)}" font-size="7" fill="#94a3b8">${placeholder}</text>
        </g>
      `
    }

    if (component.type === 'Badge') {
      const label = escape(component.props?.label ?? 'NEW')
      return `
        <g>
          <rect x="${x}" y="${y}" width="${width}" height="${height}" rx="999" fill="${fill}" stroke="${border}" stroke-width="1"/>
          <text x="${x + Math.round(width / 2)}" y="${y + Math.round(height * 0.62)}" text-anchor="middle" font-size="7" font-weight="700" fill="${component.style?.text ?? '#1d4ed8'}">${label}</text>
        </g>
      `
    }

    if (component.type === 'Slider') {
      const trackY = y + Math.max(5, Math.round(height * 0.45))
      const filledWidth = Math.max(12, Math.round(width * 0.62))
      return `
        <g>
          <rect x="${x}" y="${trackY}" width="${width}" height="4" rx="2" fill="${tint(component.style?.border ?? '#2563eb', 0.86)}"/>
          <rect x="${x}" y="${trackY}" width="${filledWidth}" height="4" rx="2" fill="${component.style?.border ?? '#2563eb'}"/>
          <circle cx="${x + filledWidth}" cy="${trackY + 2}" r="4" fill="#ffffff" stroke="${component.style?.border ?? '#2563eb'}" stroke-width="1.5"/>
        </g>
      `
    }

    const title = escape(component.props?.title ?? '')
    const body = escape(component.props?.body ?? '')
    const hasBorder = border && border !== 'transparent'
    return `
      <g>
        <rect x="${x}" y="${y}" width="${width}" height="${height}" rx="${radius}" fill="${fill}" ${hasBorder ? `stroke="${border}" stroke-width="1"` : ''}/>
        ${title ? `<rect x="${x + 8}" y="${y + 8}" width="${Math.max(24, Math.round(width * 0.45))}" height="3" rx="1.5" fill="${component.style?.text ?? '#0f172a'}" opacity="0.72"/>` : ''}
        ${body ? `<rect x="${x + 8}" y="${y + 15}" width="${Math.max(20, Math.round(width * 0.62))}" height="2.5" rx="1.25" fill="${component.style?.text ?? '#64748b'}" opacity="0.3"/>` : ''}
      </g>
    `
  }).join('')

  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 200">
      <defs>
        <linearGradient id="ss-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#f8fbff"/>
          <stop offset="100%" stop-color="#eef4ff"/>
        </linearGradient>
      </defs>
      <rect x="0" y="0" width="320" height="200" rx="14" fill="url(#ss-bg)"/>
      <rect x="8" y="8" width="304" height="184" rx="12" fill="rgba(255,255,255,0.62)"/>
      ${blocks}
    </svg>
  `
}
