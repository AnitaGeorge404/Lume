import { extractTokens, renderThemeFile } from './designTokens'

// ─── helpers ─────────────────────────────────────────────────────────────────

function s(obj) {
  return JSON.stringify(obj, null, 2)
}

function styleAttr(style, height) {
  const shadow = style.shadow ? '0 4px 18px rgba(0,0,0,.12)' : 'none'
  return `{{
      width: '100%', height: ${height},
      background: '${style.fill}',
      color: '${style.text}',
      border: '1.5px solid ${style.border}',
      borderRadius: ${style.radius},
      boxShadow: '${shadow}',
      boxSizing: 'border-box',
    }}`
}

// ─── per-type generators ──────────────────────────────────────────────────────

function genButton(c) {
  const h = Math.max(c.height, 40)
  return `
// ─── Button: ${c.props.label} ─────────────────────────────────────────────
function ${safeId(c.id)}_Button() {
  const [clicks, setClicks] = React.useState(0)
  return (
    <button
      onClick={() => setClicks(n => n + 1)}
      style=${styleAttr(c.style, h)}
    >
      ${c.props.label}{clicks > 0 ? \` (\${clicks})\` : ''}
    </button>
  )
}`.trim()
}

function genCard(c) {
  return `
// ─── Card: ${c.props.title} ───────────────────────────────────────────────
function ${safeId(c.id)}_Card() {
  return (
    <article style={{ ...${s({ background: c.style.fill, color: c.style.text,
      border: `1.5px solid ${c.style.border}`, borderRadius: c.style.radius,
      boxShadow: c.style.shadow ? '0 4px 18px rgba(0,0,0,.12)' : 'none',
      padding: '12px 16px', boxSizing: 'border-box' })} }}>
      <h4 style={{ margin: 0, fontSize: 14, fontWeight: 700 }}>${c.props.title}</h4>
      <p  style={{ margin: '6px 0 0', fontSize: 13, opacity: .7 }}>${c.props.body}</p>
    </article>
  )
}`.trim()
}

function genSlider(c) {
  return `
// ─── Slider: ${c.props.label} ─────────────────────────────────────────────
function ${safeId(c.id)}_Slider() {
  const [value, setValue] = React.useState(${c.props.value})
  return (
    <div style={{ padding: '6px 12px', background: '${c.style.fill}',
      border: '1.5px solid ${c.style.border}', borderRadius: ${c.style.radius},
      color: '${c.style.text}', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: 4 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
        <span style={{ fontWeight: 600 }}>${c.props.label}</span>
        <strong style={{ color: '${c.style.border}' }}>{value}</strong>
      </div>
      <input type="range" min={${c.props.min}} max={${c.props.max}} value={value}
        style={{ width: '100%', accentColor: '${c.style.border}' }}
        onChange={e => setValue(Number(e.target.value))} />
    </div>
  )
}`.trim()
}

function genInput(c) {
  return `
// ─── Input: ${c.props.placeholder} ───────────────────────────────────────
function ${safeId(c.id)}_Input() {
  const [value, setValue] = React.useState('')
  return (
    <input
      placeholder="${c.props.placeholder}"
      value={value}
      onChange={e => setValue(e.target.value)}
      style={{ ...${s({ background: c.style.fill, color: c.style.text,
        border: `1.5px solid ${c.style.border}`, borderRadius: c.style.radius,
        padding: '0 12px', fontSize: 13, width: '100%', height: '100%',
        boxSizing: 'border-box', outline: 'none' })} }}
    />
  )
}`.trim()
}

function safeId(id) {
  return id.replace(/[^a-zA-Z0-9]/g, '_')
}

function genBadge(c) {
  return `
// ─── Badge: ${c.props.label} ──────────────────────────────────────────────
function ${safeId(c.id)}_Badge() {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      borderRadius: 999, border: '1.5px solid ${c.style.border}',
      background: '${c.style.fill}', color: '${c.style.text}',
      fontSize: 11, fontWeight: 700, padding: '2px 10px',
      width: '100%', height: '100%', boxSizing: 'border-box',
    }}>
      ${c.props.label || '●'}
    </span>
  )
}`.trim()
}

function genDivider(c) {
  return `
// ─── Divider ──────────────────────────────────────────────────────────────────
function ${safeId(c.id)}_Divider() {
  return (
    <div style={{
      width: '100%', height: 2,
      background: '${c.style.border}',
      borderRadius: 1,
      margin: 'auto 0',
    }} />
  )
}`.trim()
}

function genComponent(c) {
  if (c.type === 'Card')    return genCard(c)
  if (c.type === 'Slider')  return genSlider(c)
  if (c.type === 'Input')   return genInput(c)
  if (c.type === 'Badge')   return genBadge(c)
  if (c.type === 'Divider') return genDivider(c)
  return genButton(c)
}

// ─── main export ──────────────────────────────────────────────────────────────

export function generateReactCode(components, profile) {
  if (components.length === 0) {
    return {
      jsx:      '// No components yet — draw something on the canvas!',
      css:      '/* No styles yet */',
      themeJs:  '// No design tokens yet — draw and style something first.',
      combined: '// Draw something on the canvas to generate code.',
    }
  }

  const componentDefs = components.map(genComponent).join('\n\n')

  const layoutItems = components.map(c => {
    const name = `${safeId(c.id)}_${c.type}`
    const minH = c.type === 'Button'  ? Math.max(c.height, 40)
               : c.type === 'Slider'  ? Math.max(c.height, 56)
               : c.type === 'Divider' ? 2
               : c.type === 'Badge'   ? Math.max(c.height, 28)
               : c.height
    return `    { id: '${c.id}', x: ${c.x}, y: ${c.y}, w: ${c.width}, h: ${minH}, Component: ${name} },`
  }).join('\n')

  const jsx = `/**
 * GeneratedUI.jsx
 * ─────────────────
 * Generated by Lume — https://lume.dev
 * Mood: ${profile?.mood ?? 'default'}
 *
 * Architecture:
 * - Each widget is a self-contained React component (copy any one out independently)
 * - LAYOUT defines absolute positions matching the original canvas sketch
 * - Import \`./theme\` to access all design tokens as named constants
 *
 * To modify: edit the individual widget functions below.
 * To retheme: edit theme.js — all colors, radii, and spacing live there.
 */

import React from 'react'
// import theme from './theme' // optional: use design tokens directly

// ─── Layout manifest ──────────────────────────────────────────────────────────
// Each entry maps a component to its position on the 760×480 canvas.

const LAYOUT = [
${layoutItems}
]

// ─── Widget components ────────────────────────────────────────────────────────
// Self-contained. Copy any of these into your own codebase.

${componentDefs}

// ─── Page root ────────────────────────────────────────────────────────────────

export default function GeneratedUI() {
  return (
    <div style={{
      position: 'relative',
      width: 760,
      height: 480,
      background: '${profile?.bg ?? '#f4f7fb'}',
      borderRadius: 12,
      overflow: 'hidden',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    }}>
      {LAYOUT.map(({ id, x, y, w, h, Component }) => (
        <div
          key={id}
          style={{ position: 'absolute', left: x, top: y, width: w, height: h }}
        >
          <Component />
        </div>
      ))}
    </div>
  )
}
`

  const css = `/* generatedStyles.css
 * ──────────────────────
 * Generated by Lume.
 * For a complete design token set, see theme.js.
 */

.generated-root {
  position: relative;
  width: 760px;
  min-height: 480px;
  background: ${profile?.bg ?? '#f4f7fb'};
  border-radius: 12px;
  overflow: hidden;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}
`

  const tokens = extractTokens(components, profile)
  const themeJs = renderThemeFile(tokens)

  const combined = [
    '/* ── GeneratedUI.jsx ── */',
    jsx,
    '/* ── generatedStyles.css ── */',
    css,
    '/* ── theme.js (design tokens) ── */',
    themeJs,
  ].join('\n\n')

  return { jsx, css, themeJs, combined }
}
