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
function ${prettyName(c)}() {
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
function ${prettyName(c)}() {
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
function ${prettyName(c)}() {
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
function ${prettyName(c)}() {
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

/** Human-readable component name derived from content props */
function prettyName(c) {
  const raw =
    c.props?.label     ||
    c.props?.title     ||
    c.props?.headline  ||
    c.props?.brand     ||
    c.props?.heading   ||
    c.props?.placeholder ||
    c.id
  const cleaned = String(raw)
    .replace(/[^a-zA-Z0-9\s]/g, '')
    .trim()
    .replace(/\s+(\w)/g, (_, ch) => ch.toUpperCase()) // camelCase words
    .replace(/\s+/g, '_')
    .slice(0, 28) || safeId(c.id)
  return `${cleaned}_${c.type}`
}

function genBadge(c) {
  return `
// ─── Badge: ${c.props.label} ──────────────────────────────────────────────
function ${prettyName(c)}() {
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
function ${prettyName(c)}() {
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

function genNav(c) {
  const links = Array.isArray(c.props.links) ? c.props.links : ['Home', 'About', 'Contact']
  const linkItems = links.map(l =>
    `        <a href="#" style={{ color: 'inherit', textDecoration: 'none', fontSize: 14, opacity: .85 }}>${l}</a>`
  ).join('\n')
  return `
// ─── Nav: ${c.props.brand} ──────────────────────────────────────────────────
function ${prettyName(c)}() {
  return (
    <nav style={{
      width: '100%', height: '100%',
      background: '${c.style.fill}', color: '${c.style.text}',
      borderBottom: '1.5px solid ${c.style.border}',
      display: 'flex', alignItems: 'center', gap: 32,
      padding: '0 24px', boxSizing: 'border-box',
    }}>
      <span style={{ fontWeight: 800, fontSize: 17 }}>${c.props.brand || 'App'}</span>
      <div style={{ display: 'flex', gap: 20, marginLeft: 'auto' }}>
${linkItems}
      </div>
    </nav>
  )
}`.trim()
}

function genHero(c) {
  const hasCta = !!c.props.cta
  const ctaEl = hasCta
    ? `\n      <button style={{ marginTop: 16, padding: '12px 32px', background: 'rgba(255,255,255,.18)', color: 'inherit', border: '2px solid rgba(255,255,255,.5)', borderRadius: 999, cursor: 'pointer', fontSize: 15, fontWeight: 700 }}>${c.props.cta}</button>`
    : ''
  return `
// ─── Hero: ${c.props.headline} ──────────────────────────────────────────────
function ${prettyName(c)}() {
  return (
    <section style={{
      width: '100%', height: '100%',
      background: 'linear-gradient(135deg, ${c.style.fill}, ${c.style.border})',
      color: '${c.style.text}',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      gap: 12, padding: '40px 32px',
      boxSizing: 'border-box', textAlign: 'center',
    }}>
      <h1 style={{ margin: 0, fontSize: 'clamp(24px, 4vw, 40px)', fontWeight: 800 }}>${c.props.headline}</h1>
      <p style={{ margin: 0, fontSize: 16, opacity: .8 }}>${c.props.subhead ?? ''}</p>${ctaEl}
    </section>
  )
}`.trim()
}

function genSection(c) {
  return `
// ─── Section: ${c.props.heading} ────────────────────────────────────────────
function ${prettyName(c)}() {
  return (
    <section style={{
      width: '100%', height: '100%',
      background: '${c.style.fill}', color: '${c.style.text}',
      border: '1.5px solid ${c.style.border}', borderRadius: ${c.style.radius},
      padding: '24px 28px', boxSizing: 'border-box',
    }}>
      <h2 style={{ margin: '0 0 8px', fontSize: 18, fontWeight: 700 }}>${c.props.heading}</h2>
      <p style={{ margin: 0, fontSize: 14, opacity: .75, lineHeight: 1.6 }}>${c.props.body ?? ''}</p>
    </section>
  )
}`.trim()
}

  function genVisualClone(c) {
    return `
  // ─── Visual Clone ────────────────────────────────────────────────────────────
  function ${prettyName(c)}() {
    return (
      <div style={{ width: '100%', height: '100%', overflow: 'hidden' }}>
        <img
          src="${c.props.imageUrl}"
          alt=""
          style={{ width: '100%', height: '100%', objectFit: '${c.props.fit || 'contain'}', display: 'block' }}
        />
      </div>
    )
  }`.trim()
  }

  function genSemanticNode(c) {
    const tag = (c.props.htmlTag || 'div').toLowerCase()
    const aria = c.props.label ? ` aria-label="${String(c.props.label).replace(/"/g, '&quot;')}"` : ''

    if (tag === 'input') {
      return `
  // ─── Semantic Lift Node ──────────────────────────────────────────────────────
  function ${prettyName(c)}() {
    return (
      <input${aria}
        style={{ width: '100%', height: '100%', opacity: 0, border: 'none', background: 'transparent' }}
      />
    )
  }`.trim()
    }

    if (tag === 'button') {
      return `
  // ─── Semantic Lift Node ──────────────────────────────────────────────────────
  function ${prettyName(c)}() {
    return (
      <button${aria}
        style={{ width: '100%', height: '100%', opacity: 0, border: 'none', background: 'transparent', cursor: 'pointer' }}
        onClick={() => {}}
      />
    )
  }`.trim()
    }

    return `
  // ─── Semantic Lift Node ──────────────────────────────────────────────────────
  function ${prettyName(c)}() {
    return (
      <${tag}${aria}
        style={{ width: '100%', height: '100%', opacity: 0, border: 'none', background: 'transparent' }}
      />
    )
  }`.trim()
  }

function genComponent(c) {
  if (c.type === 'Card')    return genCard(c)
  if (c.type === 'Slider')  return genSlider(c)
  if (c.type === 'Input')   return genInput(c)
  if (c.type === 'Badge')   return genBadge(c)
  if (c.type === 'Divider') return genDivider(c)
  if (c.type === 'Nav')     return genNav(c)
  if (c.type === 'Hero')    return genHero(c)
  if (c.type === 'Section') return genSection(c)
  if (c.type === 'VisualClone') return genVisualClone(c)
  if (c.type === 'SemanticNode') return genSemanticNode(c)
  return genButton(c)
}

// ─── main export ──────────────────────────────────────────────────────────────

const FRAMEWORK_DISPLAY = {
  react:          'React / JSX',
  vue:            'Vue SFC',
  'react-native': 'React Native',
  flutter:        'Flutter',
  html:           'HTML / CSS',
}

export function generateReactCode(components, profile, options = {}) {
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
    const name = prettyName(c)
    const minH = c.type === 'Button'  ? Math.max(c.height, 40)
               : c.type === 'Slider'  ? Math.max(c.height, 56)
               : c.type === 'Divider' ? 2
               : c.type === 'Badge'   ? Math.max(c.height, 28)
               : c.type === 'Nav'     ? Math.max(c.height, 56)
               : c.type === 'Hero'    ? Math.max(c.height, 100)
               : c.type === 'Section' ? Math.max(c.height, 80)
               : c.type === 'VisualClone' ? c.height
               : c.type === 'SemanticNode' ? c.height
               : c.height
    return `    { id: '${c.id}', x: ${c.x}, y: ${c.y}, w: ${c.width}, h: ${minH}, Component: ${name} },`
  }).join('\n')

  // Build framework-aware preamble when components come from the code pipeline
  const hasCodeSource = components.some(c => c.source === 'template' && c.sourceShape?.startsWith('code_'))
  const sourceFramework = options.sourceFramework ?? null
  const enhancedNote = hasCodeSource && sourceFramework
    ? ` * Enhanced from: ${FRAMEWORK_DISPLAY[sourceFramework] ?? sourceFramework}\n *`
    : ''

  const jsx = `/**
 * GeneratedUI.jsx
 * ─────────────────
 * Generated by Lume — UI Enhancement Platform
 * Mood: ${profile?.mood ?? 'default'}
 *${enhancedNote}
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
// ─── HTML generator ───────────────────────────────────────────────────────────

function htmlStyleAttr(styleObj) {
  return Object.entries(styleObj)
    .filter(([, v]) => v !== undefined && v !== null)
    .map(([k, v]) => {
      const prop = k.replace(/([A-Z])/g, '-$1').toLowerCase()
      return `${prop}: ${v}`
    })
    .join('; ')
}

function genHTMLComponent(c) {
  const shadow = c.style.shadow ? '0 4px 18px rgba(0,0,0,.12)' : 'none'
  const base = {
    width: '100%', height: '100%',
    background: c.style.fill,
    color: c.style.text,
    border: `1.5px solid ${c.style.border}`,
    borderRadius: `${c.style.radius}px`,
    boxShadow: shadow,
    boxSizing: 'border-box',
    fontFamily: 'inherit',
  }

  if (c.type === 'Button') {
    return `<button style="${htmlStyleAttr({ ...base, cursor: 'pointer', fontSize: '13px', fontWeight: 600, padding: '0 16px' })}">${c.props.label || 'Button'}</button>`
  }
  if (c.type === 'Card') {
    return `<div style="${htmlStyleAttr({ ...base, padding: '12px 16px' })}"><h4 style="margin:0;font-size:14px;font-weight:700">${c.props.title || 'Card'}</h4><p style="margin:6px 0 0;font-size:13px;opacity:.7">${c.props.body || ''}</p></div>`
  }
  if (c.type === 'Input') {
    return `<input placeholder="${c.props.placeholder || ''}" style="${htmlStyleAttr({ ...base, padding: '0 12px', fontSize: '13px', outline: 'none' })}" />`
  }
  if (c.type === 'Badge') {
    return `<span style="${htmlStyleAttr({ ...base, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700, padding: '2px 10px', borderRadius: '999px' })}">${c.props.label || '●'}</span>`
  }
  if (c.type === 'Divider') {
    return `<hr style="width:100%;height:1.5px;background:${c.style.border};border:none;margin:0;opacity:.55;" />`
  }
  if (c.type === 'Nav') {
    const links = Array.isArray(c.props.links) ? c.props.links : ['Home', 'About', 'Contact']
    const linkHtml = links.map(l => `<a href="#" style="color:inherit;text-decoration:none;font-size:14px;opacity:.85">${l}</a>`).join('')
    return `<nav style="${htmlStyleAttr({ ...base, display: 'flex', alignItems: 'center', gap: '32px', padding: '0 24px', borderRadius: '0' })}"><span style="font-weight:800;font-size:17px">${c.props.brand || 'App'}</span><div style="display:flex;gap:20px;margin-left:auto">${linkHtml}</div></nav>`
  }
  if (c.type === 'Hero') {
    const ctaHtml = c.props.cta ? `<button style="margin-top:16px;padding:12px 32px;background:rgba(255,255,255,.18);color:inherit;border:2px solid rgba(255,255,255,.5);border-radius:999px;cursor:pointer;font-size:15px;font-weight:700">${c.props.cta}</button>` : ''
    return `<section style="${htmlStyleAttr({ ...base, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px', padding: '40px 32px', textAlign: 'center', background: `linear-gradient(135deg, ${c.style.fill}, ${c.style.border})`, borderRadius: '0' })}"><h1 style="margin:0;font-size:clamp(24px,4vw,40px);font-weight:800">${c.props.headline || 'Hero'}</h1><p style="margin:0;font-size:16px;opacity:.8">${c.props.subhead || ''}</p>${ctaHtml}</section>`
  }
  if (c.type === 'Section') {
    return `<section style="${htmlStyleAttr({ ...base, padding: '24px 28px' })}"><h2 style="margin:0 0 8px;font-size:18px;font-weight:700">${c.props.heading || 'Section'}</h2><p style="margin:0;font-size:14px;opacity:.75;line-height:1.6">${c.props.body || ''}</p></section>`
  }
  if (c.type === 'VisualClone') {
    return `<div style="width:100%;height:100%;overflow:hidden"><img src="${c.props.imageUrl || ''}" alt="" style="width:100%;height:100%;object-fit:${c.props.fit || 'contain'};display:block" /></div>`
  }
  if (c.type === 'SemanticNode') {
    const tag = (c.props.htmlTag || 'div').toLowerCase()
    const aria = c.props.label ? ` aria-label="${String(c.props.label).replace(/"/g, '&quot;')}"` : ''
    if (tag === 'input') {
      return `<input${aria} style="width:100%;height:100%;opacity:0;border:none;background:transparent" />`
    }
    if (tag === 'button') {
      return `<button${aria} style="width:100%;height:100%;opacity:0;border:none;background:transparent;cursor:pointer"></button>`
    }
    return `<${tag}${aria} style="width:100%;height:100%;opacity:0;border:none;background:transparent"></${tag}>`
  }
  // Slider — basic HTML range
  return `<div style="${htmlStyleAttr({ ...base, padding: '6px 12px', display: 'flex', flexDirection: 'column', gap: '4px' })}"><label style="font-size:12px;font-weight:600">${c.props.label || 'Range'}</label><input type="range" min="${c.props.min ?? 0}" max="${c.props.max ?? 100}" value="${c.props.value ?? 50}" style="width:100%;accent-color:${c.style.border}" /></div>`
}

/**
 * Generate a self-contained HTML file from components.
 * @param {object[]} components
 * @param {object} [profile]
 * @param {object} [options]
 * @returns {{ html: string }}
 */
export function generateHTMLCode(components, profile, options = {}) {
  if (components.length === 0) {
    return { html: '<!-- No components yet -->' }
  }

  const hasCodeSource = components.some(c => c.source === 'template' && c.sourceShape?.startsWith('code_'))
  const sourceFramework = options.sourceFramework ?? null
  const enhancedNote = hasCodeSource && sourceFramework
    ? `\n  <!-- Enhanced from: ${FRAMEWORK_DISPLAY[sourceFramework] ?? sourceFramework} -->`
    : ''

  const divs = components.map(c => {
    const minH = c.type === 'Button'  ? Math.max(c.height, 40)
               : c.type === 'Slider'  ? Math.max(c.height, 56)
               : c.type === 'Divider' ? 2
               : c.type === 'Badge'   ? Math.max(c.height, 28)
               : c.type === 'Nav'     ? Math.max(c.height, 56)
               : c.type === 'Hero'    ? Math.max(c.height, 100)
               : c.type === 'Section' ? Math.max(c.height, 80)
               : c.type === 'VisualClone' ? c.height
               : c.type === 'SemanticNode' ? c.height
               : c.height
    const inner = genHTMLComponent(c)
    return `    <div style="position:absolute;left:${c.x}px;top:${c.y}px;width:${c.width}px;height:${minH}px">\n      ${inner}\n    </div>`
  }).join('\n')

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Generated UI — Lume</title>${enhancedNote}
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: #e8edf4;
      display: flex; align-items: center; justify-content: center;
      min-height: 100vh;
    }
    .lume-root {
      position: relative;
      width: 760px;
      height: 480px;
      background: ${profile?.bg ?? '#f4f7fb'};
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 8px 40px rgba(0,0,0,.14);
    }
  </style>
</head>
<body>
  <div class="lume-root">
${divs}
  </div>
</body>
</html>`

  return { html }
}