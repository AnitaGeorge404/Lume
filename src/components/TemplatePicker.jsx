import { useEffect } from 'react'
import { TEMPLATES } from '../lib/templates'
import './TemplatePicker.css'

const SOURCE_ICON = {
  Button:  '🔲',
  Card:    '🃏',
  Slider:  '🎚️',
  Input:   '✏️',
  Badge:   '🏷️',
  Divider: '➖',
}

/** Count component types in a template for the summary line */
function summarize(components) {
  if (!components.length) return 'Empty canvas — draw anything you like'
  const counts = {}
  components.forEach(c => { counts[c.type] = (counts[c.type] ?? 0) + 1 })
  return Object.entries(counts)
    .map(([type, n]) => `${n} ${type}${n > 1 ? 's' : ''}`)
    .join(' · ')
}

/** Tiny SVG minimap of a template's component positions */
function MiniMap({ components }) {
  const W = 220
  const H = 130
  const sx = W / 760
  const sy = H / 480

  if (!components.length) {
    return (
      <div className="minimap minimap-blank">
        <span className="minimap-blank-icon">✦</span>
        <span className="minimap-blank-label">Draw freely</span>
      </div>
    )
  }

  const TYPE_FILL = {
    Button:  '#6366f1',
    Card:    '#bfdbfe',
    Slider:  '#0ea5e9',
    Input:   '#fef9c3',
    Badge:   '#d1fae5',
    Divider: '#e2e8f0',
  }

  return (
    <svg className="minimap" viewBox={`0 0 ${W} ${H}`} width={W} height={H}>
      <rect x="0" y="0" width={W} height={H} fill="#f8fafc" rx="8" />
      {components.map(c => (
        <rect
          key={c.id}
          x={Math.round(c.x * sx)}
          y={Math.round(c.y * sy)}
          width={Math.max(4, Math.round(c.width * sx))}
          height={Math.max(3, Math.round(c.height * sy))}
          fill={TYPE_FILL[c.type] ?? '#6366f1'}
          rx="2"
          opacity="0.85"
        />
      ))}
    </svg>
  )
}

export function TemplatePicker({ onSelect, onDismiss }) {
  // Close on Escape
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
            Templates pre-fill the canvas. You can still draw and edit anything.
          </p>
        </div>

        <div className="tpl-grid">
          {TEMPLATES.map(tpl => (
            <button
              key={tpl.id}
              className="tpl-card"
              onClick={() => onSelect(tpl.id)}
            >
              <MiniMap components={tpl.components} />
              <div className="tpl-card-body">
                <span className="tpl-card-icon">{tpl.icon}</span>
                <span className="tpl-card-label">{tpl.label}</span>
                <span className="tpl-card-desc">{tpl.description}</span>
                <span className="tpl-card-summary">{summarize(tpl.components)}</span>
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
