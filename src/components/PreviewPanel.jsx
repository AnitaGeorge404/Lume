import { useEffect, useMemo, useRef, useState } from 'react'
import './PreviewPanel.css'

const CANVAS_W = 760
const CANVAS_H = 480

// ─── Widget renderers ─────────────────────────────────────────────────────────

function widgetBox(c, extra = {}) {
  return {
    width: '100%', height: '100%',
    borderRadius: c.style.radius,
    border: `1.5px solid ${c.style.border}`,
    background: c.style.fill,
    color: c.style.text,
    boxShadow: c.style.shadow ? '0 4px 18px rgba(0,0,0,.13)' : 'none',
    transition: 'all .22s ease',
    boxSizing: 'border-box',
    overflow: 'hidden',
    ...extra,
  }
}

function UIButton({ c, clicks, onClick }) {
  return (
    <button
      className="pw-button"
      style={widgetBox(c, {
        cursor: 'pointer', fontSize: 13, fontWeight: 600, letterSpacing: '.02em',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
      })}
      onClick={onClick}
    >
      {c.props.label}
      {clicks > 0 && <span className="click-badge">{clicks}</span>}
    </button>
  )
}

function UICard({ c }) {
  return (
    <article className="pw-card" style={widgetBox(c, { padding: '10px 14px' })}>
      <h4 className="card-title" style={{ color: c.style.text }}>{c.props.title}</h4>
      <p className="card-body"  style={{ color: c.style.text }}>{c.props.body}</p>
    </article>
  )
}

function UISlider({ c, value, onChange }) {
  const pct = Math.round(((value - c.props.min) / (c.props.max - c.props.min)) * 100)
  return (
    <div className="pw-slider" style={widgetBox(c, {
      display: 'flex', flexDirection: 'column', gap: 4,
      padding: '6px 12px', justifyContent: 'center',
    })}>
      <div className="slider-header">
        <span className="slider-label" style={{ color: c.style.text }}>{c.props.label}</span>
        <span className="slider-value"  style={{ color: c.style.border }}>{value}</span>
      </div>
      <input
        type="range" className="slider-track"
        min={c.props.min} max={c.props.max} value={value}
        style={{ '--accent': c.style.border }}
        onChange={e => onChange(Number(e.target.value))}
      />
      <div className="slider-track-labels" style={{ color: c.style.text }}>
        <span>{c.props.min}</span><span style={{ color: c.style.border }}>{pct}%</span><span>{c.props.max}</span>
      </div>
    </div>
  )
}

function UIInput({ c, value, onChange }) {
  return (
    <input
      className="pw-input"
      style={widgetBox(c, { padding: '0 12px', fontSize: 13, cursor: 'text' })}
      placeholder={c.props.placeholder}
      value={value}
      onChange={e => onChange(e.target.value)}
    />
  )
}

function UIBadge({ c }) {
  return (
    <span className="pw-badge" style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      borderRadius: 999, border: `1.5px solid ${c.style.border}`,
      background: c.style.fill, color: c.style.text,
      fontSize: 11, fontWeight: 700, padding: '2px 10px',
      width: '100%', height: '100%', boxSizing: 'border-box',
    }}>
      {c.props.label || '●'}
    </span>
  )
}

function UIDivider({ c }) {
  return (
    <div className="pw-divider" style={{
      width: '100%', height: 2, background: c.style.border,
      borderRadius: 1, margin: 'auto 0',
    }} />
  )
}

// ─── Main panel ───────────────────────────────────────────────────────────────

export function PreviewPanel({ components, profile }) {
  const outerRef = useRef(null)
  const [scale, setScale] = useState(1)
  const [buttonClicks, setButtonClicks] = useState({})
  const [sliderValues, setSliderValues] = useState({})
  const [inputValues,  setInputValues]  = useState({})

  // Scale the 760×480 viewport to always fit the container panel
  useEffect(() => {
    const el = outerRef.current
    if (!el) return
    const obs = new ResizeObserver(([{ contentRect }]) => {
      setScale(Math.min(1, (contentRect.width - 4) / CANVAS_W))
    })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  const sorted = useMemo(
    () => [...components].sort((a, b) => a.y - b.y || a.x - b.x),
    [components],
  )

  function render(c) {
    if (c.type === 'Card')    return <UICard key={c.id} c={c} />
    if (c.type === 'Slider')  return (
      <UISlider key={c.id} c={c}
        value={sliderValues[c.id] ?? c.props.value}
        onChange={v => setSliderValues(p => ({ ...p, [c.id]: v }))}
      />
    )
    if (c.type === 'Input')   return (
      <UIInput key={c.id} c={c}
        value={inputValues[c.id] ?? ''}
        onChange={v => setInputValues(p => ({ ...p, [c.id]: v }))}
      />
    )
    if (c.type === 'Badge')   return <UIBadge   key={c.id} c={c} />
    if (c.type === 'Divider') return <UIDivider key={c.id} c={c} />
    return (
      <UIButton key={c.id} c={c}
        clicks={buttonClicks[c.id] ?? 0}
        onClick={() => setButtonClicks(p => ({ ...p, [c.id]: (p[c.id] ?? 0) + 1 }))}
      />
    )
  }

  const bgColor = profile?.bg ?? '#f4f7fb'

  return (
    <div className="preview-outer" ref={outerRef}>
      {/* Container that collapses to scaled height */}
      <div className="preview-scaler" style={{ height: CANVAS_H * scale }}>
        {/* The actual 760×480 board, CSS-scaled to fit */}
        <div
          className="preview-board"
          style={{
            width: CANVAS_W, height: CANVAS_H,
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
            background: bgColor,
          }}
        >
          {sorted.map(c => (
            <div
              key={c.id}
              style={{
                position: 'absolute',
                left: c.x, top: c.y,
                width: c.width,
                height: Math.max(c.height, c.type === 'Button' ? 40 : c.type === 'Slider' ? 56 : 28),
              }}
            >
              {render(c)}
            </div>
          ))}

          {sorted.length === 0 && (
            <div className="preview-empty">
              <div className="preview-empty-icon">✏️</div>
              <p>Draw on the canvas</p>
              <p className="preview-empty-sub">Components appear here instantly</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
