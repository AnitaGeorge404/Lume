import { useEffect, useRef, useState } from 'react'
import { TEMPLATES } from '../lib/templates'
import './TemplatePicker.css'

// ─── Live HTML mini-preview of a template ───────────────────────────────────────
// Renders actual styled elements at 760×480, scaled down via CSS transform.
// This produces a "screenshot" effect — users see real UI, not wireframe blocks.

function MiniPreview({ components }) {
  const ref = useRef(null)
  const [s, setS] = useState(0.29)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new ResizeObserver(([e]) => setS(e.contentRect.width / 760))
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  if (!components.length) {
    return (
      <div className="mini-preview-wrap mini-preview-blank" ref={ref}>
        <div className="mini-blank-content">
          <span className="mini-blank-icon">✦</span>
          <span className="mini-blank-label">Start from scratch</span>
        </div>
      </div>
    )
  }

  return (
    <div className="mini-preview-wrap" ref={ref}>
      <div className="mini-preview-board" style={{ width: 760, height: 480, transform: `scale(${s})` }}>
        {components.map(c => (
          <div key={c.id} style={{ position: 'absolute', left: c.x, top: c.y, width: c.width, height: c.height, boxSizing: 'border-box', overflow: 'hidden' }}>
            <MiniWidget c={c} />
          </div>
        ))}
      </div>
    </div>
  )
}

function MiniWidget({ c }) {
  const s = c.style
  switch (c.type) {
    case 'Nav':
      return (
        <div style={{ width: '100%', height: '100%', background: s.fill, color: s.text, borderBottom: `1.5px solid ${s.border}`, display: 'flex', alignItems: 'center', padding: '0 18px', gap: 14, boxSizing: 'border-box', boxShadow: s.shadow ? '0 1px 4px rgba(0,0,0,.1)' : 'none' }}>
          <span style={{ fontWeight: 800, fontSize: 13, whiteSpace: 'nowrap', letterSpacing: '-.01em' }}>{c.props.brand || 'App'}</span>
          <div style={{ display: 'flex', gap: 12, marginLeft: 'auto' }}>
            {(c.props.links || []).map((l, i) => <span key={i} style={{ fontSize: 10, opacity: .7, whiteSpace: 'nowrap', fontWeight: 500 }}>{l}</span>)}
          </div>
        </div>
      )
    case 'Hero':
      return (
        <div style={{ width: '100%', height: '100%', background: `linear-gradient(135deg, ${s.fill}, ${s.border})`, color: s.text, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 7, textAlign: 'center', padding: '14px 20px', boxSizing: 'border-box' }}>
          <span style={{ fontSize: 16, fontWeight: 800, lineHeight: 1.2, letterSpacing: '-.02em' }}>{c.props.headline}</span>
          {c.props.subhead && <span style={{ fontSize: 10, opacity: .78, lineHeight: 1.35, maxWidth: '85%' }}>{c.props.subhead}</span>}
          {c.props.cta && <span style={{ marginTop: 4, fontSize: 9, fontWeight: 700, padding: '4px 14px', border: '1.5px solid rgba(255,255,255,.45)', borderRadius: 999, background: 'rgba(255,255,255,.15)' }}>{c.props.cta}</span>}
        </div>
      )
    case 'Section':
      return (
        <div style={{ width: '100%', height: '100%', background: s.fill, color: s.text, border: `1px solid ${s.border}`, borderRadius: s.radius, padding: '10px 14px', boxSizing: 'border-box' }}>
          <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 4, lineHeight: 1.2 }}>{c.props.heading}</div>
          <div style={{ fontSize: 9, opacity: .65, lineHeight: 1.45 }}>{c.props.body}</div>
        </div>
      )
    case 'Card':
      return (
        <div style={{ width: '100%', height: '100%', background: s.fill, color: s.text, border: `1px solid ${s.border}`, borderRadius: s.radius, padding: '10px 12px', boxSizing: 'border-box', boxShadow: s.shadow ? '0 2px 8px rgba(0,0,0,.08)' : 'none' }}>
          <div style={{ fontSize: 11, fontWeight: 700, marginBottom: 4, lineHeight: 1.2, letterSpacing: '-.01em' }}>{c.props.title}</div>
          <div style={{ fontSize: 9, opacity: .62, lineHeight: 1.45, whiteSpace: 'pre-line' }}>{c.props.body}</div>
        </div>
      )
    case 'Button':
      return (
        <div style={{ width: '100%', height: '100%', background: s.fill, color: s.text, border: `1.5px solid ${s.border}`, borderRadius: s.radius, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, boxShadow: s.shadow ? '0 2px 6px rgba(0,0,0,.12)' : 'none', letterSpacing: '.01em' }}>
          {c.props.label}
        </div>
      )
    case 'Input':
      return (
        <div style={{ width: '100%', height: '100%', background: s.fill, border: `1px solid ${s.border}`, borderRadius: s.radius, display: 'flex', alignItems: 'center', padding: '0 12px', boxSizing: 'border-box' }}>
          <span style={{ fontSize: 10, color: '#94a3b8', opacity: .8 }}>{c.props.placeholder}</span>
        </div>
      )
    case 'Badge':
      return (
        <div style={{ width: '100%', height: '100%', background: s.fill, color: s.text, border: `1px solid ${s.border}`, borderRadius: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, fontWeight: 700, letterSpacing: '.02em' }}>
          {c.props.label}
        </div>
      )
    case 'Divider':
      return <div style={{ width: '100%', height: 1.5, background: s.border, opacity: .5, marginTop: Math.max(0, c.height / 2 - 1) }} />
    case 'Slider': {
      const pct = Math.round(((c.props.value - c.props.min) / Math.max(1, c.props.max - c.props.min)) * 100)
      return (
        <div style={{ width: '100%', height: '100%', background: s.fill, border: `1px solid ${s.border}`, borderRadius: s.radius, padding: '6px 10px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 4 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 8, fontWeight: 700, color: s.text }}>{c.props.label}</span>
            <span style={{ fontSize: 9, fontWeight: 700, color: s.border }}>{c.props.value}</span>
          </div>
          <div style={{ width: '100%', height: 4, borderRadius: 2, background: 'rgba(0,0,0,.1)', position: 'relative' }}>
            <div style={{ width: `${pct}%`, height: '100%', borderRadius: 2, background: s.border }} />
          </div>
        </div>
      )
    }
    default:
      return <div style={{ width: '100%', height: '100%', background: s.fill, borderRadius: s.radius, border: `1px solid ${s.border}` }} />
  }
}

export function TemplatePicker({ onSelect, onDismiss }) {
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onDismiss() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onDismiss])

  return (
    <div className="tpl-backdrop" onClick={onDismiss}>
      <div className="tpl-modal" onClick={e => e.stopPropagation()}>
        <div className="tpl-modal-header">
          <div className="tpl-modal-title">
            <span className="tpl-title-icon">✦</span>
            <span>Choose a starting point</span>
          </div>
          <p className="tpl-modal-sub">
            Every template is production-ready. Edit, refine, and ship.
          </p>
        </div>

        <div className="tpl-grid">
          {TEMPLATES.map(tpl => (
            <button
              key={tpl.id}
              className="tpl-card"
              onClick={() => onSelect(tpl.id)}
            >
              <MiniPreview components={tpl.components} />
              <div className="tpl-card-body">
                <span className="tpl-card-icon">{tpl.icon}</span>
                <span className="tpl-card-label">{tpl.label}</span>
                <span className="tpl-card-desc">{tpl.description}</span>
              </div>
            </button>
          ))}
        </div>

        <div className="tpl-modal-footer">
          <button className="tpl-dismiss-btn" onClick={onDismiss}>
            Skip — start blank
          </button>
        </div>
      </div>
    </div>
  )
}
