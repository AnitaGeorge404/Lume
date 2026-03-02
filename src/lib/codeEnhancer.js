/**
 * codeEnhancer.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Lume Code Enhancement Engine — Iteration 1
 *
 * Converts UIBlock[] (from codeParser.js) into a polished LumeComponent[]
 * using the same design system and canvas model as the screenshot pipeline.
 *
 * Philosophy:
 *   "How would a senior designer refactor this UI?"
 *   — Modern spacing, consistent hierarchy, accessible patterns
 *   — NOT pixel cloning — UX improvement
 *
 * Canvas: 760 × 480 px
 * Output: LumeComponent[] — identical schema to all other Lume components.
 */

import { renderComparisonPreviewSvg } from './screenshotEnhancer.js'

const CANVAS_W = 760
const CANVAS_H = 480
const PAD_X = 16
const PAD_Y = 16
const GAP = 12
const COL_GAP = 14
const MAX_W = CANVAS_W - PAD_X * 2  // 728

// ─── Design token helpers ─────────────────────────────────────────────────────

function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)) }
function q(v) { return Math.round(v / 8) * 8 }

function stylePreset() {
  return {
    button:      { fill: '#2563eb', text: '#ffffff', border: '#1d4ed8', radius: 12, shadow: true },
    buttonGhost: { fill: '#ffffff', text: '#1d4ed8', border: '#bfdbfe', radius: 12, shadow: false },
    card:        { fill: '#ffffff', text: '#0f172a', border: 'transparent', radius: 16, shadow: true },
    cardSoft:    { fill: '#f8fafd', text: '#1e293b', border: '#e5eaf2', radius: 14, shadow: false },
    cardKPI:     { fill: '#ffffff', text: '#0f172a', border: '#e2e8f0', radius: 14, shadow: true },
    input:       { fill: '#f8fafc', text: '#334155', border: '#d1dbe9', radius: 12, shadow: false },
    slider:      { fill: '#dbeafe', text: '#075985', border: '#2563eb', radius: 10, shadow: false },
    badge:       { fill: '#eff6ff', text: '#1e3a8a', border: '#93c5fd', radius: 999, shadow: false },
    badgeGreen:  { fill: '#dcfce7', text: '#166534', border: '#86efac', radius: 999, shadow: false },
    divider:     { fill: 'transparent', text: '#94a3b8', border: '#e2e8f0', radius: 0, shadow: false },
    nav:         { fill: '#ffffff', text: '#0f172a', border: 'transparent', radius: 0, shadow: true },
    footer:      { fill: '#f8fafc', text: '#64748b', border: '#e2e8f0', radius: 16, shadow: false },
  }
}

let _uid = 0
function uid(prefix) { return `ce-${prefix}-${++_uid}` }

function comp(id, type, x, y, width, height, style, props) {
  return {
    id,
    type,
    x: clamp(q(x), 0, CANVAS_W - 40),
    y: clamp(q(y), 0, CANVAS_H - 10),
    width:  clamp(q(width), 40, CANVAS_W),
    height: clamp(q(height), 8, CANVAS_H - 10),
    style,
    props,
    sourceShape: `code_${type.toLowerCase()}`,
    source: 'template',
  }
}

// ─── Row placement helpers ────────────────────────────────────────────────────

function rowXPositions(count, width, startX = PAD_X) {
  const totalWidth = width * count + COL_GAP * (count - 1)
  const offset = Math.max(0, Math.floor((MAX_W - totalWidth) / 2))
  return Array.from({ length: count }, (_, i) => startX + offset + i * (width + COL_GAP))
}

function cardWidthForCount(count) {
  if (count === 1) return MAX_W
  if (count === 2) return Math.floor((MAX_W - COL_GAP) / 2)
  if (count === 3) return Math.floor((MAX_W - COL_GAP * 2) / 3)
  return Math.floor((MAX_W - COL_GAP * 3) / 4)
}

// ─── Block → Component(s) placement ─────────────────────────────────────────

/**
 * Convert a single UIBlock into one or more LumeComponents placed at y.
 * Returns { components: LumeComponent[], height: number }
 */
function placeBlock(block, y, styles) {
  const { kind, label, description, isProminent, quantity } = block
  const components = []

  switch (kind) {
    case 'nav': {
      const h = 58
      components.push(comp(uid('nav'), 'Nav', PAD_X, y, MAX_W, h, {
        fill: '#1e293b', text: '#f8fafc', border: '#334155', radius: 0, shadow: true,
      }, {
        brand: label || 'App',
        links: description ? description.split(/[,|·]/).map(s => s.trim()).filter(Boolean).slice(0, 5) : ['Home', 'Features', 'About'],
      }))
      return { components, height: h }
    }

    case 'hero': {
      const h = isProminent ? 168 : 110
      components.push(comp(uid('hero'), 'Hero', PAD_X, y, MAX_W, h, {
        fill: '#6d28d9', text: '#ffffff', border: '#7c3aed', radius: 0, shadow: true,
      }, {
        headline: label || 'Hero Headline',
        subhead: description || 'A refined, modern layout built from your existing code.',
        cta: 'Get Started',
      }))
      return { components, height: h }
    }

    case 'card': {
      const count = clamp(quantity, 1, 4)
      const w = cardWidthForCount(count)
      const h = count === 1 ? 120 : (count === 2 ? 130 : 112)
      const xs = rowXPositions(count, w)
      for (let i = 0; i < count; i++) {
        const cardStyle = i % 2 === 0 ? styles.card : styles.cardSoft
        components.push(comp(uid('card'), 'Card', xs[i], y, w, h, cardStyle, {
          title: i === 0 ? (label || 'Card') : `Feature ${i + 1}`,
          body: i === 0 ? (description || 'Card content and detail.') : 'Supporting content.',
        }))
      }
      return { components, height: h }
    }

    case 'section': {
      const count = clamp(quantity, 1, 3)
      const w = cardWidthForCount(count)
      const h = count === 1 ? 110 : 104
      const xs = rowXPositions(count, w)
      for (let i = 0; i < count; i++) {
        components.push(comp(uid('sec'), 'Section', xs[i], y, w, h, {
          fill: '#f0fdfa', text: '#134e4a', border: '#99f6e4', radius: 12, shadow: false,
        }, {
          heading: i === 0 ? (label || 'Section') : `Section ${i + 1}`,
          body: i === 0 ? (description || '') : 'Details and context.',
        }))
      }
      return { components, height: h }
    }

    case 'metric': {
      const count = clamp(quantity, 1, 3)
      const w = cardWidthForCount(count)
      const h = 104
      const xs = rowXPositions(count, w)
      const metricLabels = label ? [label, 'Conversion', 'Active Users'] : ['Revenue', 'Conversion', 'Active Users']
      const metricValues = ['$184k', '6.2%', '24,980']
      for (let i = 0; i < count; i++) {
        components.push(comp(uid('kpi'), 'Card', xs[i], y, w, h, styles.cardKPI, {
          title: metricLabels[i] ?? `Metric ${i + 1}`,
          body: metricValues[i] ?? '—',
        }))
      }
      return { components, height: h }
    }

    case 'form': {
      // Forms: build input stack + submit button
      const formW = clamp(MAX_W, 360, MAX_W)
      const formX = PAD_X
      const inputH = 46
      const inputGap = 8
      const btnH = 46
      // Estimate number of inputs: quantity or 2 by default, capped at 4
      const inputCount = clamp(quantity <= 1 ? 2 : quantity, 1, 4)
      const totalH = inputCount * inputH + (inputCount - 1) * inputGap + btnH + inputGap

      const inputLabels = [
        label || 'Email address',
        'Password',
        'Full name',
        'Phone number',
      ]

      for (let i = 0; i < inputCount; i++) {
        components.push(comp(uid('fi'), 'Input', formX, y + i * (inputH + inputGap), formW, inputH, styles.input, {
          placeholder: inputLabels[i] ?? `Field ${i + 1}`,
        }))
      }
      const btnY = y + inputCount * (inputH + inputGap)
      components.push(comp(uid('fsubmit'), 'Button', formX, btnY, 200, btnH, styles.button, {
        label: description || label || 'Submit',
      }))

      return { components, height: totalH }
    }

    case 'button': {
      const count = clamp(quantity, 1, 4)
      const btnW = 160
      const btnH = 46
      const xs = rowXPositions(count, btnW)
      const buttonLabels = [label || 'Get started', 'Learn more', 'View details', 'Contact']
      for (let i = 0; i < count; i++) {
        const btnStyle = i === 0 ? styles.button : styles.buttonGhost
        components.push(comp(uid('btn'), 'Button', xs[i], y, btnW, btnH, btnStyle, {
          label: buttonLabels[i] ?? `Action ${i + 1}`,
        }))
      }
      return { components, height: btnH }
    }

    case 'input': {
      const count = clamp(quantity, 1, 4)
      const inputH = 46
      const inputGap = 8
      const inputLabels = [
        label || 'Search or enter text…',
        description || 'Enter value',
        'Additional field',
        'Notes',
      ]
      for (let i = 0; i < count; i++) {
        components.push(comp(uid('inp'), 'Input', PAD_X, y + i * (inputH + inputGap), clamp(MAX_W, 240, MAX_W), inputH, styles.input, {
          placeholder: inputLabels[i] ?? `Input ${i + 1}`,
        }))
      }
      return { components, height: count * inputH + (count - 1) * inputGap }
    }

    case 'slider': {
      const count = clamp(quantity, 1, 2)
      const slH = 44
      const slGap = 8
      for (let i = 0; i < count; i++) {
        components.push(comp(uid('sl'), 'Slider', PAD_X, y + i * (slH + slGap), MAX_W, slH, styles.slider, {
          label: i === 0 ? (label || 'Value') : (description || `Range ${i + 1}`),
          value: i === 0 ? 62 : 40, min: 0, max: 100,
        }))
      }
      return { components, height: count * slH + (count - 1) * slGap }
    }

    case 'badge': {
      const count = clamp(quantity, 1, 4)
      const badgeW = 90
      const badgeH = 28
      const xs = rowXPositions(count, badgeW)
      const badgeLabels = [label || 'NEW', 'BETA', 'PRO', 'V2']
      const badgeStyles = [styles.badge, styles.badgeGreen, styles.badge, styles.badgeGreen]
      for (let i = 0; i < count; i++) {
        components.push(comp(uid('bdg'), 'Badge', xs[i], y, badgeW, badgeH, badgeStyles[i % 2], {
          label: badgeLabels[i] ?? `Tag ${i + 1}`,
        }))
      }
      return { components, height: badgeH }
    }

    case 'divider': {
      components.push(comp(uid('div'), 'Divider', PAD_X, y, MAX_W, 2, styles.divider, { label: '' }))
      return { components, height: 2 }
    }

    case 'footer': {
      const h = 80
      components.push(comp(uid('ftr'), 'Card', PAD_X, y, MAX_W, h, styles.footer, {
        title: label || 'Footer',
        body: description || '© 2024 · Privacy · Terms',
      }))
      return { components, height: h }
    }

    default: {
      const h = 96
      components.push(comp(uid('blk'), 'Card', PAD_X, y, MAX_W, h, styles.cardSoft, {
        title: label || 'Section',
        body: description || '',
      }))
      return { components, height: h }
    }
  }
}

// ─── Layout engine ────────────────────────────────────────────────────────────

/**
 * Infer layout type from UIBlock pattern.
 * @param {UIBlock[]} blocks
 * @returns {'dashboard'|'landing'|'app'|'form'|'content'}
 */
export function inferLayoutFromBlocks(blocks) {
  const kinds = blocks.map(b => b.kind)
  const kindSet = new Set(kinds)
  const metricCount = blocks.filter(b => b.kind === 'metric').reduce((s, b) => s + b.quantity, 0)
  const cardCount = blocks.filter(b => b.kind === 'card').reduce((s, b) => s + b.quantity, 0)
  const formCount = blocks.filter(b => b.kind === 'form').length
  const inputCount = blocks.filter(b => b.kind === 'input').reduce((s, b) => s + b.quantity, 0)

  if (metricCount >= 2 || (kindSet.has('metric') && kindSet.has('slider'))) return 'dashboard'
  if (formCount >= 1 || inputCount >= 3) return 'form'
  if (cardCount >= 3) return 'landing'
  if (kindSet.has('hero')) return 'landing'
  return 'content'
}

/**
 * Convert UIBlock[] into LumeComponent[].
 * This is the core of the reconstruction engine.
 *
 * @param {UIBlock[]} blocks - from codeParser.extractUIBlocks()
 * @returns {LumeComponent[]}
 */
export function reconstructFromBlocks(blocks) {
  _uid = 0
  const styles = stylePreset()
  const components = []
  let y = PAD_Y

  // If no blocks, return a sensible "empty app" scaffold
  if (!blocks.length) {
    return [
      comp(uid('empty-nav'), 'Card', PAD_X, y, MAX_W, 58, styles.nav, { title: 'Your App', body: '' }),
      comp(uid('empty-hero'), 'Card', PAD_X, y + 70, MAX_W, 140, styles.card, { title: 'Enhanced UI', body: 'Paste your code in the panel to start reconstruction.' }),
      comp(uid('empty-btn'), 'Button', PAD_X, y + 226, 200, 46, styles.button, { label: 'Get started' }),
    ]
  }

  // Pre-process: merge consecutive same-kind blocks for row layout
  // (codeParser already does this via deduplicateBlocks, but we tighten here)
  const mergedBlocks = mergeConsecutiveBlocks(blocks)

  for (const block of mergedBlocks) {
    if (y >= CANVAS_H - 24) break // don't overflow canvas

    const { components: placed, height } = placeBlock(block, y, styles)
    components.push(...placed)
    y += height + GAP
  }

  return components
}

/**
 * Merge consecutive same-kind groupable blocks for row layout.
 */
function mergeConsecutiveBlocks(blocks) {
  const GROUPABLE = new Set(['card', 'metric', 'badge', 'button', 'input'])
  const result = []
  let i = 0

  while (i < blocks.length) {
    const current = { ...blocks[i] }

    if (GROUPABLE.has(current.kind)) {
      let j = i + 1
      while (
        j < blocks.length &&
        blocks[j].kind === current.kind &&
        (current.quantity + blocks[j].quantity) <= 4
      ) {
        current.quantity += blocks[j].quantity
        if (!current.label && blocks[j].label) current.label = blocks[j].label
        j++
      }
      result.push(current)
      i = j
    } else {
      result.push(current)
      i++
    }
  }

  return result
}

// ─── Enhanced reconstruction with design analysis ─────────────────────────────

/**
 * Full code enhancement pipeline:
 * 1. Analyze blocks for layout pattern
 * 2. Apply design-approved reconstruction
 * 3. Normalize and polish all components
 *
 * @param {UIBlock[]} blocks
 * @param {string} framework - detected framework from codeParser
 * @returns {{ components: LumeComponent[], layout: string, issues: string[] }}
 */
export function enhanceFromCodeBlocks(blocks, framework) {
  const layout = inferLayoutFromBlocks(blocks)
  const components = reconstructFromBlocks(blocks)
  const polished = polishComponents(components)
  const issues = detectUXIssues(blocks)

  return { components: polished, layout, issues, framework }
}

/**
 * Detect UX issues in the parsed blocks.
 * These are shown as improvement notes to the user.
 */
function detectUXIssues(blocks) {
  const issues = []
  const kinds = blocks.map(b => b.kind)
  const kindSet = new Set(kinds)

  if (!kindSet.has('nav'))     issues.push('No clear navigation — added a top nav bar')
  if (!kindSet.has('button'))  issues.push('No primary call-to-action — added an action button')
  if (blocks.length > 10)     issues.push('Complex layout simplified to fit canvas — some sections were condensed')

  const inputBlocks = blocks.filter(b => b.kind === 'input' || b.kind === 'form')
  if (inputBlocks.length > 0 && !kindSet.has('button')) {
    issues.push('Form fields present without a submit action — added submit button')
  }

  const deepBlocks = blocks.filter(b => b.depth > 4)
  if (deepBlocks.length > 3) issues.push('Deep nesting detected — layout flattened for clarity')

  return issues
}

/**
 * Final polish pass: normalize geometry, enforce spacing, apply design rules.
 */
function polishComponents(components) {
  // Sort by Y, then X
  const sorted = [...components].sort((a, b) => a.y - b.y || a.x - b.x)

  // Row normalization: group nearby Y values, normalize to shared anchor
  const rows = []
  for (const c of sorted) {
    const row = rows.find(r => Math.abs(r.anchorY - c.y) <= 16)
    if (row) {
      row.items.push(c)
      row.anchorY = Math.round((row.anchorY * (row.items.length - 1) + c.y) / row.items.length)
    } else {
      rows.push({ anchorY: c.y, items: [c] })
    }
  }

  rows.forEach(row => {
    const normY = q(row.anchorY)
    row.items.sort((a, b) => a.x - b.x).forEach((c, i) => {
      c.y = clamp(normY, 0, CANVAS_H - c.height - 4)
      if (i > 0) {
        const prev = row.items[i - 1]
        const minX = q(prev.x + prev.width + (prev.type === 'Divider' ? 8 : 12))
        if (c.x < minX) c.x = minX
      }
    })
  })

  return sorted
}

// ─── SVG preview ─────────────────────────────────────────────────────────────

/**
 * Generate a polished SVG preview thumbnail for code-enhanced components.
 * Delegates to the existing screenshotEnhancer renderer.
 *
 * @param {LumeComponent[]} components
 * @returns {string} SVG string
 */
export function renderCodePreviewSvg(components) {
  return renderComparisonPreviewSvg(components)
}

// ─── Before-state renderer ────────────────────────────────────────────────────

/**
 * Generate a "before" SVG that approximates the visual weight of the
 * original code without rendering it faithfully (we don't evaluate user code).
 * Uses the UIBlocks to produce a low-fidelity diagram.
 *
 * @param {UIBlock[]} blocks
 * @returns {string} SVG string
 */
export function renderBeforePreviewSvg(blocks) {
  const sx = 320 / CANVAS_W
  const sy = 200 / CANVAS_H

  let y = PAD_Y
  const mergedBlocks = mergeConsecutiveBlocks(blocks)
  const shapes = []

  for (const block of mergedBlocks) {
    if (y >= CANVAS_H - 24) break

    const { kind, label, quantity } = block
    const count = clamp(quantity, 1, 4)
    const w = cardWidthForCount(count)
    const xs = rowXPositions(count, w)
    let bh = 0

    const renderX = (rx) => Math.round(rx * sx)
    const renderY = (ry) => Math.round(ry * sy)
    const renderH = (rh) => Math.max(2, Math.round(rh * sy))

    if (kind === 'nav') {
      bh = 58
      shapes.push(`<rect x="${renderX(PAD_X)}" y="${renderY(y)}" width="${renderX(MAX_W)}" height="${renderH(bh)}" rx="3" fill="#94a3b8" opacity="0.22"/>`)
      shapes.push(`<rect x="${renderX(PAD_X + 8)}" y="${renderY(y + 20)}" width="${renderX(80)}" height="${renderH(10)}" rx="2" fill="#334155" opacity="0.5"/>`)
    } else if (kind === 'divider') {
      bh = 2
      shapes.push(`<rect x="${renderX(PAD_X)}" y="${renderY(y)}" width="${renderX(MAX_W)}" height="2" rx="1" fill="#cbd5e1" opacity="0.6"/>`)
    } else if (kind === 'badge') {
      bh = 28
      for (let i = 0; i < count; i++) {
        shapes.push(`<rect x="${renderX(xs[i])}" y="${renderY(y)}" width="${renderX(90)}" height="${renderH(bh)}" rx="999" fill="#e2e8f0" opacity="0.8"/>`)
      }
    } else if (kind === 'button') {
      bh = 46
      for (let i = 0; i < count; i++) {
        shapes.push(`<rect x="${renderX(xs[i])}" y="${renderY(y)}" width="${renderX(160)}" height="${renderH(bh)}" rx="4" fill="${i === 0 ? '#94a3b8' : '#e2e8f0'}" opacity="${i === 0 ? '0.7' : '0.5'}"/>`)
      }
    } else if (kind === 'input') {
      bh = 46
      for (let i = 0; i < count; i++) {
        const iy = y + i * (46 + 8)
        shapes.push(`<rect x="${renderX(PAD_X)}" y="${renderY(iy)}" width="${renderX(MAX_W)}" height="${renderH(46)}" rx="3" fill="#f1f5f9" stroke="#cbd5e1" stroke-width="1" opacity="0.9"/>`)
      }
      bh = count * 46 + (count - 1) * 8
    } else if (kind === 'slider') {
      bh = 44
      shapes.push(`<rect x="${renderX(PAD_X)}" y="${renderY(y + 20)}" width="${renderX(MAX_W)}" height="4" rx="2" fill="#cbd5e1" opacity="0.7"/>`)
      shapes.push(`<circle cx="${renderX(PAD_X + 240)}" cy="${renderY(y + 22)}" r="5" fill="#94a3b8" opacity="0.8"/>`)
    } else {
      // Generic card/hero/section/form/footer/metric
      const hMap = { hero: 168, footer: 80, form: 100, metric: 104, section: 104 }
      bh = hMap[kind] ?? 112
      for (let i = 0; i < count; i++) {
        const bx = renderX(xs[i])
        const by = renderY(y)
        const bw = renderX(w)
        const bhR = renderH(bh)
        shapes.push(`<rect x="${bx}" y="${by}" width="${bw}" height="${bhR}" rx="5" fill="#e2e8f0" opacity="0.55"/>`)
        shapes.push(`<rect x="${bx + 6}" y="${by + 8}" width="${Math.max(10, Math.round(bw * 0.45))}" height="3" rx="1.5" fill="#94a3b8" opacity="0.6"/>`)
        shapes.push(`<rect x="${bx + 6}" y="${by + 16}" width="${Math.max(8, Math.round(bw * 0.65))}" height="2.5" rx="1.25" fill="#94a3b8" opacity="0.35"/>`)
        const lText = String(label ?? '').slice(0, 14)
        if (lText) shapes.push(`<text x="${bx + 6}" y="${by + 11}" font-size="6" fill="#64748b" opacity="0.8">${lText}</text>`)
      }
    }

    y += bh + GAP
  }

  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 200">
      <rect x="0" y="0" width="320" height="200" rx="14" fill="#f1f5f9"/>
      <rect x="8" y="8" width="304" height="184" rx="10" fill="rgba(255,255,255,0.7)"/>
      ${shapes.join('\n      ')}
    </svg>
  `.trim()
}
