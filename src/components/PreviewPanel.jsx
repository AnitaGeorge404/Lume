import { useEffect, useMemo, useRef, useState } from 'react'
import { getAnimProfile } from '../lib/semantics'
import './PreviewPanel.css'

const CANVAS_W = 760
const CANVAS_H = 480

// ─── Base widget box style ─────────────────────────────────────────────────────

function widgetBox(c, extra = {}) {
  const anim = getAnimProfile(c.type)
  return {
    width: '100%', height: '100%',
    borderRadius: c.style.radius,
    border: `1.5px solid ${c.style.border}`,
    background: c.style.fill,
    color: c.style.text,
    boxShadow: c.style.shadow ? '0 4px 18px rgba(0,0,0,.13)' : 'none',
    transition: `transform ${anim.duration}ms ${anim.easing}, box-shadow ${anim.duration}ms ${anim.easing}, filter ${anim.duration}ms ${anim.easing}`,
    boxSizing: 'border-box',
    overflow: 'hidden',
    ...extra,
  }
}

// ─── Button ───────────────────────────────────────────────────────────────────

function UIButton({ c, clicks, onPress }) {
  const [pressed, setPressed] = useState(false)
  const anim = getAnimProfile('Button')

  const handleDown = () => setPressed(true)
  const handleUp   = () => { setPressed(false); onPress() }
  const handleLeave = () => setPressed(false)

  const pressStyle = pressed ? {
    transform: `scale(${anim.pressScale})`,
    filter:    'brightness(0.91)',
    boxShadow: c.style.shadow ? '0 1px 4px rgba(0,0,0,.18)' : 'none',
  } : {
    transform:  'scale(1)',
    filter:     'brightness(1)',
    boxShadow: c.style.shadow ? '0 4px 18px rgba(0,0,0,.13)' : 'none',
  }

  return (
    <button
      className="pw-button"
      style={{ ...widgetBox(c, {
        cursor: 'pointer', fontSize: 13, fontWeight: 600, letterSpacing: '.02em',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
        userSelect: 'none',
      }), ...pressStyle }}
      onMouseDown={handleDown}
      onMouseUp={handleUp}
      onMouseLeave={handleLeave}
      onTouchStart={handleDown}
      onTouchEnd={handleUp}
    >
      {c.props.label}
      {clicks > 0 && (
        <span className="click-badge">{clicks}</span>
      )}
    </button>
  )
}

// ─── Card ─────────────────────────────────────────────────────────────────────

function UICard({ c }) {
  return (
    <article
      className="pw-card"
      style={widgetBox(c, { padding: '12px 16px', cursor: 'default' })}
    >
      <h4 className="card-title" style={{ color: c.style.text }}>
        {c.props.title}
      </h4>
      <p className="card-body" style={{ color: c.style.text }}>
        {c.props.body}
      </p>
    </article>
  )
}

// ─── Slider ───────────────────────────────────────────────────────────────────

function UISlider({ c, value, onChange }) {
  const pct = Math.max(0, Math.min(100,
    Math.round(((value - c.props.min) / Math.max(1, c.props.max - c.props.min)) * 100)
  ))

  // Filled track: gradient from accent → muted
  const trackStyle = {
    '--accent': c.style.border,
    '--fill-pct': `${pct}%`,
    // Applied via CSS custom property in PreviewPanel.css
  }

  return (
    <div
      className="pw-slider"
      style={widgetBox(c, {
        display: 'flex', flexDirection: 'column', gap: 6,
        padding: '8px 14px', justifyContent: 'center',
      })}
    >
      <div className="slider-header">
        <span className="slider-label" style={{ color: c.style.text }}>
          {c.props.label}
        </span>
        <strong className="slider-value" style={{ color: c.style.border }}>
          {value}
        </strong>
      </div>
      <input
        type="range"
        className="slider-track"
        min={c.props.min}
        max={c.props.max}
        value={value}
        style={trackStyle}
        onChange={e => onChange(Number(e.target.value))}
      />
      <div className="slider-track-labels" style={{ color: c.style.text, opacity: 0.55 }}>
        <span>{c.props.min}</span>
        <span style={{ color: c.style.border, opacity: 0.9, fontWeight: 700 }}>{pct}%</span>
        <span>{c.props.max}</span>
      </div>
    </div>
  )
}

// ─── Input ────────────────────────────────────────────────────────────────────

function UIInput({ c, value, onChange }) {
  const [focused, setFocused] = useState(false)
  return (
    <input
      className="pw-input"
      style={{
        ...widgetBox(c, {
          padding: '0 14px', fontSize: 13, cursor: 'text',
          outline: 'none',
        }),
        boxShadow: focused
          ? `0 0 0 3px ${c.style.border}40, ${c.style.shadow ? '0 4px 18px rgba(0,0,0,.08)' : 'none'}`
          : c.style.shadow ? '0 2px 6px rgba(0,0,0,.06)' : 'none',
        borderColor: focused ? c.style.border : c.style.border + '99',
      }}
      placeholder={c.props.placeholder}
      value={value}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      onChange={e => onChange(e.target.value)}
    />
  )
}

// ─── Badge ────────────────────────────────────────────────────────────────────

function UIBadge({ c }) {
  return (
    <span className="pw-badge" style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      borderRadius: 999,
      border: `1.5px solid ${c.style.border}`,
      background: c.style.fill,
      color: c.style.text,
      fontSize: 11, fontWeight: 700, padding: '2px 10px',
      width: '100%', height: '100%',
      boxSizing: 'border-box',
      transition: 'transform .1s ease',
      cursor: 'default',
    }}>
      {c.props.label || '●'}
    </span>
  )
}

// ─── Divider ──────────────────────────────────────────────────────────────────

function UIDivider({ c }) {
  return (
    <div className="pw-divider" style={{
      width: '100%', height: 1.5,
      background: c.style.border,
      borderRadius: 1,
      opacity: 0.55,
    }} />
  )
}

// ─── Main panel ───────────────────────────────────────────────────────────────

export function PreviewPanel({ components, profile }) {
  const outerRef = useRef(null)
  const [scale, setScale]             = useState(1)
  const [buttonClicks, setButtonClicks] = useState({})
  const [sliderValues, setSliderValues] = useState({})
  const [inputValues,  setInputValues]  = useState({})

  // Scale the 760×480 viewport to always fit the container
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

  function renderWidget(c) {
    switch (c.type) {
      case 'Card':
        return <UICard key={c.id} c={c} />
      case 'Slider':
        return (
          <UISlider
            key={c.id} c={c}
            value={sliderValues[c.id] ?? c.props.value}
            onChange={v => setSliderValues(p => ({ ...p, [c.id]: v }))}
          />
        )
      case 'Input':
        return (
          <UIInput
            key={c.id} c={c}
            value={inputValues[c.id] ?? ''}
            onChange={v => setInputValues(p => ({ ...p, [c.id]: v }))}
          />
        )
      case 'Badge':
        return <UIBadge key={c.id} c={c} />
      case 'Divider':
        return <UIDivider key={c.id} c={c} />
      default:
        return (
          <UIButton
            key={c.id} c={c}
            clicks={buttonClicks[c.id] ?? 0}
            onPress={() => setButtonClicks(p => ({ ...p, [c.id]: (p[c.id] ?? 0) + 1 }))}
          />
        )
    }
  }

  const bgColor = profile?.bg ?? '#f4f7fb'

  return (
    <div className="preview-outer" ref={outerRef}>
      <div className="preview-scaler" style={{ height: CANVAS_H * scale }}>
        <div
          className="preview-board"
          style={{
            width: CANVAS_W,
            height: CANVAS_H,
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
            background: bgColor,
          }}
        >
          {sorted.map(c => (
            <div
              key={c.id}
              className="preview-frame"
              style={{
                position: 'absolute',
                left:   c.x,
                top:    c.y,
                width:  c.width,
                height: Math.max(
                  c.height,
                  c.type === 'Button'  ? 40  :
                  c.type === 'Slider'  ? 60  :
                  c.type === 'Input'   ? 36  :
                  c.type === 'Divider' ? 2   : 28
                ),
              }}
            >
              {renderWidget(c)}
            </div>
          ))}

          {sorted.length === 0 && (
            <div className="preview-empty">
              <div className="preview-empty-icon">✏️</div>
              <p className="preview-empty-title">Draw on the canvas</p>
              <p className="preview-empty-sub">Components appear here as you sketch</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}


// end of PreviewPanel.jsx
