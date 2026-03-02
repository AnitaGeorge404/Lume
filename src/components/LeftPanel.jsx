import { useEffect, useMemo, useRef, useState } from 'react'
import { TEMPLATES } from '../lib/templates'
import { COMPONENT_TYPES, TYPE_ACCENT } from '../lib/componentModel'
import './LeftPanel.css'

const PUBLIC_COMPONENT_TYPES = COMPONENT_TYPES.filter(type => !['VisualClone', 'SemanticNode'].includes(type))

const MODES = [
  { id: 'draw',       icon: '✏︎', label: 'Draw'      },
  { id: 'code',       icon: '</>',label: 'Code'      },
  { id: 'upload',     icon: '🖼', label: 'Image'     },
  { id: 'templates',  icon: '◫',  label: 'Templates' },
  { id: 'components', icon: '◧',  label: 'Parts'     },
  { id: 'styles',     icon: '✦',  label: 'Styles'    },
  { id: 'layouts',    icon: '▦',  label: 'Layouts'   },
]

const FRAMEWORK_LABELS = {
  react:          'React',
  vue:            'Vue',
  'react-native': 'React Native',
  flutter:        'Flutter',
  html:           'HTML / CSS',
  unknown:        'Code',
}

const LAYOUT_LABELS = {
  dashboard: 'Dashboard',
  landing:   'Landing Page',
  app:       'App Interface',
  form:      'Form',
  content:   'Content Page',
}

const STYLE_CARDS = [
  { key: 'default', label: 'Default', prompt: '', colors: ['#eef2ff', '#ffffff', '#6366f1'], radius: 12 },
  { key: 'minimal', label: 'Minimal', prompt: 'minimal clean neutral', colors: ['#f8fafc', '#ffffff', '#111827'], radius: 6 },
  { key: 'playful', label: 'Playful', prompt: 'playful energetic colorful', colors: ['#fff7ed', '#ffedd5', '#f97316'], radius: 16 },
  { key: 'modern-dark', label: 'Dark Pro', prompt: 'modern dark premium', colors: ['#0b1220', '#111827', '#60a5fa'], radius: 12 },
  { key: 'corporate', label: 'Corporate', prompt: 'corporate professional calm', colors: ['#eff6ff', '#ffffff', '#1d4ed8'], radius: 8 },
  { key: 'warm', label: 'Warm', prompt: 'warm editorial friendly', colors: ['#fef3c7', '#fffbeb', '#b45309'], radius: 12 },
  { key: 'neon', label: 'Neon', prompt: 'neon cyber glow', colors: ['#030712', '#0f172a', '#22d3ee'], radius: 10 },
  { key: 'soft', label: 'Soft', prompt: 'soft pastel elegant', colors: ['#fce7f3', '#fdf2f8', '#ec4899'], radius: 14 },
]

const TEMPLATE_CATEGORIES = ['All', 'Featured', 'Landing', 'App', 'Forms', 'Store']

const TEMPLATE_CATEGORY_MAP = {
  blank: ['All'],
  'landing-saas': ['All', 'Featured', 'Landing'],
  'ecommerce': ['All', 'Featured', 'Store'],
  'portfolio': ['All', 'Featured', 'Landing'],
  'dashboard': ['All', 'Featured', 'App'],
  'booking': ['All', 'Forms'],
  'pricing': ['All', 'Landing'],
  'blog': ['All', 'Landing'],
}

const LAYOUT_CARDS = [
  { id: 'layout-hero', label: 'Hero + CTA', desc: 'Nav, hero section, CTA', colors: ['#1e3a8a', '#3b82f6'] },
  { id: 'layout-two-col', label: 'Two Column', desc: 'Balanced content split', colors: ['#0f172a', '#334155'] },
  { id: 'layout-grid', label: 'Feature Grid', desc: 'Four card grid layout', colors: ['#059669', '#10b981'] },
  { id: 'layout-app', label: 'App Dashboard', desc: 'Nav + metric cards', colors: ['#7c3aed', '#a78bfa'] },
  { id: 'layout-single', label: 'Single Focus', desc: 'Centered conversion', colors: ['#ea580c', '#f97316'] },
]

function buildLayoutComponents(layoutId) {
  const style = {
    navDark:      { fill: '#0f172a', text: '#f1f5f9', border: '#1e293b', radius: 0, shadow: true },
    navWhite:     { fill: '#ffffff', text: '#0f172a', border: '#e2e8f0', radius: 0, shadow: true },
    heroBlue:     { fill: '#1e3a8a', text: '#ffffff', border: '#3b82f6', radius: 0, shadow: false },
    heroDark:     { fill: '#0f172a', text: '#f8fafc', border: '#334155', radius: 0, shadow: false },
    heroViolet:   { fill: '#4c1d95', text: '#f5f3ff', border: '#8b5cf6', radius: 0, shadow: false },
    button:       { fill: '#2563eb', text: '#ffffff', border: '#1d4ed8', radius: 12, shadow: true },
    buttonGhost:  { fill: '#ffffff', text: '#2563eb', border: '#bfdbfe', radius: 12, shadow: false },
    buttonGreen:  { fill: '#059669', text: '#ffffff', border: '#047857', radius: 12, shadow: true },
    card:         { fill: '#ffffff', text: '#0f172a', border: '#e2e8f0', radius: 16, shadow: true },
    cardSoft:     { fill: '#f8fafc', text: '#0f172a', border: '#e2e8f0', radius: 14, shadow: false },
    input:        { fill: '#ffffff', text: '#334155', border: '#cbd5e1', radius: 12, shadow: false },
    slider:       { fill: '#eff6ff', text: '#1e3a8a', border: '#3b82f6', radius: 10, shadow: false },
    divider:      { fill: 'transparent', text: '#94a3b8', border: '#e2e8f0', radius: 0, shadow: false },
    badge:        { fill: '#dbeafe', text: '#1e40af', border: '#93c5fd', radius: 999, shadow: false },
    section:      { fill: '#f8fafc', text: '#0f172a', border: '#e2e8f0', radius: 16, shadow: false },
  }

  const t = (id, type, x, y, width, height, styleKey, props) => ({
    id, type, x, y, width, height,
    style: style[styleKey] ?? style.button,
    props,
    sourceShape: `layout_${type.toLowerCase()}`,
    source: 'template',
  })

  if (layoutId === 'layout-hero') {
    return [
      t('ly-hero-nav', 'Nav', 0, 0, 760, 52, 'navDark', { brand: 'Product Studio', links: ['Features', 'Pricing', 'Docs'] }),
      t('ly-hero-hero', 'Hero', 0, 52, 760, 180, 'heroBlue', { headline: 'Build and launch in days', subhead: 'Generate production-ready React UI from rough ideas.', cta: 'Get started free' }),
      t('ly-hero-div', 'Divider', 30, 244, 700, 2, 'divider', { label: '' }),
      t('ly-hero-card-a', 'Card', 30, 262, 224, 150, 'card', { title: 'Auto Layouts', body: 'Generate sensible responsive blocks.' }),
      t('ly-hero-card-b', 'Card', 268, 262, 224, 150, 'card', { title: 'Styled Components', body: 'Polished visual defaults included.' }),
      t('ly-hero-card-c', 'Card', 506, 262, 224, 150, 'card', { title: 'Code Export', body: 'Ship JSX + CSS instantly.' }),
      t('ly-hero-cta', 'Button', 280, 430, 200, 40, 'button', { label: 'Start building →' }),
    ]
  }

  if (layoutId === 'layout-two-col') {
    return [
      t('ly-2c-nav', 'Nav', 0, 0, 760, 52, 'navWhite', { brand: 'Product Studio', links: ['About', 'Features', 'Contact'] }),
      t('ly-2c-div', 'Divider', 0, 52, 760, 2, 'divider', { label: '' }),
      t('ly-2c-left', 'Section', 20, 70, 355, 340, 'section', { heading: 'Left content', body: 'Long-form details, documentation, and copy.' }),
      t('ly-2c-right', 'Section', 390, 70, 350, 340, 'section', { heading: 'Right content', body: 'CTA, highlights, and testimonials.' }),
      t('ly-2c-btn-a', 'Button', 44, 352, 138, 42, 'button', { label: 'Get started' }),
      t('ly-2c-btn-b', 'Button', 194, 352, 138, 42, 'buttonGhost', { label: 'Learn more' }),
    ]
  }

  if (layoutId === 'layout-grid') {
    return [
      t('ly-grd-hero', 'Hero', 0, 0, 760, 104, 'heroDark', { headline: 'Everything your team needs', subhead: 'All core modules in one place.', cta: '' }),
      t('ly-grd-a', 'Card', 20, 120, 355, 158, 'card', { title: 'Analytics', body: 'KPIs and trends in real-time.' }),
      t('ly-grd-b', 'Card', 390, 120, 350, 158, 'card', { title: 'Automations', body: 'Reduce repetitive workflows.' }),
      t('ly-grd-c', 'Card', 20, 294, 355, 158, 'card', { title: 'Collaboration', body: 'Comment, approve, and track work.' }),
      t('ly-grd-d', 'Card', 390, 294, 350, 158, 'card', { title: 'Security', body: 'Role controls and audit logs.' }),
    ]
  }

  if (layoutId === 'layout-app') {
    return [
      t('ly-app-nav', 'Nav', 0, 0, 760, 50, 'navDark', { brand: 'Revenue Dashboard', links: ['Dashboard', 'Reports', 'Settings'] }),
      t('ly-app-div', 'Divider', 0, 50, 760, 2, 'divider', { label: '' }),
      t('ly-app-m1', 'Card', 20, 68, 230, 100, 'card', { title: 'MRR', body: '$92,400' }),
      t('ly-app-m2', 'Card', 265, 68, 230, 100, 'card', { title: 'Churn', body: '2.1%' }),
      t('ly-app-m3', 'Card', 510, 68, 230, 100, 'card', { title: 'Expansion', body: '+18.4%' }),
      t('ly-app-sl', 'Slider', 20, 186, 474, 44, 'slider', { label: 'Forecast confidence', value: 72, min: 0, max: 100 }),
      t('ly-app-search', 'Input', 20, 246, 474, 46, 'input', { placeholder: 'Search accounts…' }),
      t('ly-app-btn', 'Button', 510, 246, 230, 46, 'button', { label: 'Create report' }),
      t('ly-app-feed', 'Section', 20, 308, 720, 148, 'section', { heading: 'Recent activity', body: '5 new opportunities created today.' }),
    ]
  }

  if (layoutId === 'layout-single') {
    return [
      t('ly-sing-wrap', 'Card', 140, 34, 480, 220, 'card', { title: 'Book a demo', body: 'See how teams ship polished UI faster.' }),
      t('ly-sing-badge', 'Badge', 164, 56, 100, 24, 'badge', { label: 'Step 1 of 2' }),
      t('ly-sing-email', 'Input', 184, 168, 392, 46, 'input', { placeholder: 'Work email' }),
      t('ly-sing-btn', 'Button', 298, 228, 164, 44, 'buttonGreen', { label: 'Continue →' }),
      t('ly-sing-foot', 'Section', 140, 280, 480, 150, 'section', { heading: 'Trusted by teams', body: 'Over 3,000 teams use Lume every week.' }),
    ]
  }

  return []
}

function componentPreview(type) {
  const accent = TYPE_ACCENT[type] ?? '#6366f1'

  if (type === 'Button') {
    return (
      <div className="comp-preview-live">
        <div style={{ background: `linear-gradient(135deg, ${accent}, #4338ca)`, color: '#fff', borderRadius: 10, padding: '7px 18px', fontSize: 11, fontWeight: 700, textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,.15)', letterSpacing: '.01em' }}>Get started</div>
      </div>
    )
  }

  if (type === 'Card') {
    return (
      <div className="comp-preview-live">
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: '8px 10px', boxShadow: '0 2px 8px rgba(0,0,0,.06)' }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: '#0f172a', marginBottom: 3 }}>Content Card</div>
          <div style={{ fontSize: 8, color: '#64748b', lineHeight: 1.3 }}>Real styled content</div>
        </div>
      </div>
    )
  }

  if (type === 'Slider') {
    return (
      <div className="comp-preview-live">
        <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 8, padding: '6px 10px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <span style={{ fontSize: 8, fontWeight: 700, color: '#1e3a8a' }}>Progress</span>
            <span style={{ fontSize: 8, fontWeight: 700, color: accent }}>72</span>
          </div>
          <div style={{ height: 4, borderRadius: 2, background: '#dbeafe', position: 'relative' }}>
            <div style={{ width: '72%', height: '100%', borderRadius: 2, background: accent }} />
          </div>
        </div>
      </div>
    )
  }

  if (type === 'Input') {
    return (
      <div className="comp-preview-live">
        <div style={{ background: '#fff', border: '1px solid #cbd5e1', borderRadius: 8, padding: '7px 10px', display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ width: 1.5, height: 12, background: accent, borderRadius: 1, flexShrink: 0 }} />
          <span style={{ fontSize: 9, color: '#94a3b8' }}>Type something…</span>
        </div>
      </div>
    )
  }

  if (type === 'Badge') {
    return (
      <div className="comp-preview-live" style={{ justifyContent: 'center' }}>
        <div style={{ background: `${accent}1a`, border: `1.5px solid ${accent}55`, borderRadius: 999, padding: '4px 14px', textAlign: 'center' }}>
          <span style={{ fontSize: 9, fontWeight: 700, color: accent }}>New Feature</span>
        </div>
      </div>
    )
  }

  if (type === 'Nav') {
    return (
      <div className="comp-preview-live">
        <div style={{ background: '#0f172a', borderRadius: 8, padding: '6px 10px', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 9, fontWeight: 800, color: '#f1f5f9' }}>Brand</span>
          <div style={{ display: 'flex', gap: 6, marginLeft: 'auto' }}>
            <span style={{ fontSize: 7, color: '#94a3b8' }}>Home</span>
            <span style={{ fontSize: 7, color: '#94a3b8' }}>About</span>
          </div>
        </div>
      </div>
    )
  }

  if (type === 'Hero') {
    return (
      <div className="comp-preview-live">
        <div style={{ background: 'linear-gradient(135deg, #1e3a8a, #3b82f6)', borderRadius: 10, padding: '8px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, textAlign: 'center' }}>
          <span style={{ fontSize: 10, fontWeight: 800, color: '#fff' }}>Headline</span>
          <span style={{ fontSize: 7, color: 'rgba(255,255,255,.7)' }}>Subheadline text</span>
          <span style={{ fontSize: 6, fontWeight: 700, color: '#fff', padding: '2px 8px', border: '1px solid rgba(255,255,255,.4)', borderRadius: 999, marginTop: 2 }}>CTA</span>
        </div>
      </div>
    )
  }

  if (type === 'Section') {
    return (
      <div className="comp-preview-live">
        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: '8px 10px' }}>
          <div style={{ fontSize: 9, fontWeight: 700, color: '#0f172a', marginBottom: 3 }}>Section Title</div>
          <div style={{ fontSize: 7, color: '#64748b', lineHeight: 1.3 }}>Content area with body text.</div>
        </div>
      </div>
    )
  }

  // Divider
  return (
    <div className="comp-preview-live" style={{ justifyContent: 'center', padding: '18px 10px' }}>
      <div style={{ width: '100%', height: 2, borderRadius: 1, background: 'linear-gradient(90deg, transparent, #cbd5e1, transparent)' }} />
    </div>
  )
}

/** Render a live HTML mini-preview of a template (same approach as TemplatePicker) */
function TemplateMiniPreview({ components }) {
  const ref = useRef(null)
  const [s, setS] = useState(0.38)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new ResizeObserver(([e]) => setS(e.contentRect.width / 760))
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  if (!components.length) {
    return (
      <div className="lp-mini-wrap lp-mini-blank" ref={ref}>
        <span className="lp-mini-blank-icon">✦</span>
        <span className="lp-mini-blank-label">Blank</span>
      </div>
    )
  }

  return (
    <div className="lp-mini-wrap" ref={ref}>
      <div className="lp-mini-board" style={{ width: 760, height: 480, transform: `scale(${s})` }}>
        {components.map(c => (
          <div key={c.id} style={{ position: 'absolute', left: c.x, top: c.y, width: c.width, height: c.height, boxSizing: 'border-box', overflow: 'hidden' }}>
            <MiniElement c={c} />
          </div>
        ))}
      </div>
    </div>
  )
}

/** Minimal inline-styled renderer for template thumbnail elements */
function MiniElement({ c }) {
  const s = c.style
  switch (c.type) {
    case 'Nav':
      return (
        <div style={{ width: '100%', height: '100%', background: s.fill, color: s.text, borderBottom: `1px solid ${s.border}`, display: 'flex', alignItems: 'center', padding: '0 14px', boxSizing: 'border-box', gap: 10 }}>
          <span style={{ fontWeight: 800, fontSize: 11, whiteSpace: 'nowrap' }}>{c.props.brand}</span>
          <div style={{ display: 'flex', gap: 10, marginLeft: 'auto' }}>
            {(c.props.links || []).map((l, i) => <span key={i} style={{ fontSize: 8, opacity: .65, whiteSpace: 'nowrap' }}>{l}</span>)}
          </div>
        </div>
      )
    case 'Hero':
      return (
        <div style={{ width: '100%', height: '100%', background: `linear-gradient(135deg, ${s.fill}, ${s.border})`, color: s.text, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 5, textAlign: 'center', padding: '10px 14px', boxSizing: 'border-box' }}>
          <span style={{ fontSize: 13, fontWeight: 800, lineHeight: 1.2 }}>{c.props.headline}</span>
          {c.props.subhead && <span style={{ fontSize: 8, opacity: .75, lineHeight: 1.3 }}>{c.props.subhead}</span>}
          {c.props.cta && <span style={{ marginTop: 2, fontSize: 7, fontWeight: 700, padding: '2px 10px', border: '1px solid rgba(255,255,255,.4)', borderRadius: 999, background: 'rgba(255,255,255,.12)' }}>{c.props.cta}</span>}
        </div>
      )
    case 'Section':
      return (
        <div style={{ width: '100%', height: '100%', background: s.fill, color: s.text, border: `1px solid ${s.border}`, borderRadius: s.radius, padding: '8px 10px', boxSizing: 'border-box' }}>
          <div style={{ fontSize: 10, fontWeight: 700, marginBottom: 3 }}>{c.props.heading}</div>
          <div style={{ fontSize: 7, opacity: .6, lineHeight: 1.4 }}>{c.props.body}</div>
        </div>
      )
    case 'Card':
      return (
        <div style={{ width: '100%', height: '100%', background: s.fill, color: s.text, border: `1px solid ${s.border}`, borderRadius: s.radius, padding: '8px 10px', boxSizing: 'border-box', boxShadow: s.shadow ? '0 1px 4px rgba(0,0,0,.06)' : 'none' }}>
          <div style={{ fontSize: 9, fontWeight: 700, marginBottom: 3 }}>{c.props.title}</div>
          <div style={{ fontSize: 7, opacity: .6, lineHeight: 1.4, whiteSpace: 'pre-line' }}>{c.props.body}</div>
        </div>
      )
    case 'Button':
      return (
        <div style={{ width: '100%', height: '100%', background: s.fill, color: s.text, border: `1px solid ${s.border}`, borderRadius: s.radius, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, fontWeight: 700, boxShadow: s.shadow ? '0 1px 4px rgba(0,0,0,.1)' : 'none' }}>
          {c.props.label}
        </div>
      )
    case 'Input':
      return (
        <div style={{ width: '100%', height: '100%', background: s.fill, border: `1px solid ${s.border}`, borderRadius: s.radius, display: 'flex', alignItems: 'center', padding: '0 8px', boxSizing: 'border-box' }}>
          <span style={{ fontSize: 8, color: '#94a3b8' }}>{c.props.placeholder}</span>
        </div>
      )
    case 'Badge':
      return (
        <div style={{ width: '100%', height: '100%', background: s.fill, color: s.text, border: `1px solid ${s.border}`, borderRadius: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 7, fontWeight: 700 }}>
          {c.props.label}
        </div>
      )
    case 'Divider':
      return <div style={{ width: '100%', height: 1, background: s.border, opacity: .45, marginTop: Math.max(0, c.height / 2 - 1) }} />
    case 'Slider': {
      const pct = Math.round(((c.props.value - c.props.min) / Math.max(1, c.props.max - c.props.min)) * 100)
      return (
        <div style={{ width: '100%', height: '100%', background: s.fill, border: `1px solid ${s.border}`, borderRadius: s.radius, padding: '5px 8px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 3 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 6, fontWeight: 700, color: s.text }}>{c.props.label}</span>
            <span style={{ fontSize: 7, fontWeight: 700, color: s.border }}>{c.props.value}</span>
          </div>
          <div style={{ width: '100%', height: 3, borderRadius: 2, background: 'rgba(0,0,0,.08)' }}>
            <div style={{ width: `${pct}%`, height: '100%', borderRadius: 2, background: s.border }} />
          </div>
        </div>
      )
    }
    default:
      return <div style={{ width: '100%', height: '100%', background: s.fill, borderRadius: s.radius }} />
  }
}

export function LeftPanel({
  onTemplateSelect,
  onStyleSelect,
  appliedPrompt,
  onScreenshotUpload,
  onScreenshotAnalyze,
  onScreenshotApply,
  onScreenshotDiscard,
  screenshotState,
  // Code pipeline
  onCodeUpload,
  onCodeChange,
  onCodeParse,
  onCodeApply,
  onCodeDiscard,
  codeState,
}) {
  const [mode, setMode] = useState('templates')
  const [category, setCategory] = useState('Featured')
  const [draggingType, setDraggingType] = useState(null)
  const uploadRef = useRef(null)
  const codeFileRef = useRef(null)

  const visibleTemplates = useMemo(() => (
    TEMPLATES.filter(template => (TEMPLATE_CATEGORY_MAP[template.id] ?? ['All']).includes(category))
  ), [category])

  const handleDragStart = (event, type) => {
    event.dataTransfer.setData('lume/component-type', type)
    event.dataTransfer.effectAllowed = 'copy'
    setDraggingType(type)
  }

  const handleDragEnd = () => setDraggingType(null)

  const handleLayoutClick = (layoutId) => {
    const components = buildLayoutComponents(layoutId)
    onTemplateSelect(null, components)
  }

  const hasScreenshot = Boolean(screenshotState?.dataUrl)
  const hasCode = Boolean(codeState?.rawCode?.trim())

  return (
    <aside className="left-panel">
      <header className="lp-header">
        <div className="lp-title-wrap">
          <p className="lp-eyebrow">Design Library</p>
          <h2 className="lp-title">Add Elements</h2>
        </div>
        <button className="lp-search-btn" title="Search templates and parts">⌕</button>
      </header>

      <nav className="lp-modenav">
        {MODES.map(modeItem => (
          <button
            key={modeItem.id}
            className={`lp-modebt ${mode === modeItem.id ? 'active' : ''}`}
            onClick={() => setMode(modeItem.id)}
            title={modeItem.label}
          >
            <span className="lp-modebt-icon">{modeItem.icon}</span>
            <span className="lp-modebt-label">{modeItem.label}</span>
          </button>
        ))}
      </nav>

      <div className="lp-body">
        {mode === 'draw' && (
          <section className="lp-section">
            <div className="lp-draw-card">
              <div className="lp-draw-icon">✏️</div>
              <h3>Sketch first</h3>
              <p>Use rectangle, circle, line, or freehand in the canvas toolbar to generate clean UI parts.</p>
            </div>
            <div className="lp-tip-grid">
              <div className="lp-tip"><strong>Wide rect</strong><span>→ Input field</span></div>
              <div className="lp-tip"><strong>Big rect</strong><span>→ Content card</span></div>
              <div className="lp-tip"><strong>Long line</strong><span>→ Slider / divider</span></div>
              <div className="lp-tip"><strong>Small circle</strong><span>→ Badge token</span></div>
            </div>
          </section>
        )}

        {mode === 'code' && (
          <section className="lp-section">
            <div className="lp-section-head">
              <h3>Code Upload</h3>
              <span>Code → Better UI</span>
            </div>

            <div className="lp-code-intro">
              <p>Paste or upload your existing UI code. Lume reconstructs it using modern, production-ready components.</p>
              <div className="lp-code-formats">
                {['HTML', 'React', 'Vue', 'Flutter', 'RN'].map(f => (
                  <span key={f} className="lp-code-fmt">{f}</span>
                ))}
              </div>
            </div>

            {/* Hidden code file input */}
            <input
              ref={codeFileRef}
              type="file"
              accept=".html,.css,.jsx,.tsx,.js,.ts,.vue,.dart,.txt"
              className="lp-upload-input"
              onChange={(event) => {
                const file = event.target.files?.[0]
                if (!file) return
                onCodeUpload(file)
                event.target.value = ''
              }}
            />

            <button className="lp-upload-btn" onClick={() => codeFileRef.current?.click()}>
              📎 Upload code file
            </button>

            {/* Framework detection badge */}
            {codeState?.rawCode?.trim() && (
              <div className="lp-code-fw-row">
                <span className="lp-code-fw-badge">
                  {FRAMEWORK_LABELS[codeState.framework] ?? 'Code'}
                </span>
                {codeState.elementCount > 0 && (
                  <span className="lp-code-fw-count">
                    {codeState.elementCount} element{codeState.elementCount !== 1 ? 's' : ''}
                  </span>
                )}
                {codeState.fileName && (
                  <span className="lp-code-fw-file" title={codeState.fileName}>
                    {codeState.fileName.length > 20 ? `${codeState.fileName.slice(0, 18)}…` : codeState.fileName}
                  </span>
                )}
              </div>
            )}

            {/* Code textarea */}
            <textarea
              className="lp-code-textarea"
              placeholder={`Paste HTML, React, Vue, Flutter or React Native code…\n\nExample:\n<nav>…</nav>\n<section class="hero">…</section>`}
              value={codeState?.rawCode ?? ''}
              onChange={e => onCodeChange(e.target.value)}
              spellCheck={false}
            />

            {/* Analysis results */}
            {codeState?.status === 'enhanced' && (
              <div className="lp-code-insights">
                <div className="lp-code-insight-header">
                  <span className="lp-code-insight-icon">◈</span>
                  <span>
                    {LAYOUT_LABELS[codeState.layout] ?? 'UI Layout'} detected ·{' '}
                    <strong>{codeState.elementCount}</strong> elements
                  </span>
                </div>
                {codeState.issues.slice(0, 3).map((issue, i) => (
                  <div key={i} className="lp-code-issue">✦ {issue}</div>
                ))}
              </div>
            )}

            {/* Actions */}
            {hasCode ? (
              <div className="lp-code-actions">
                <button className="lp-upload-action" onClick={onCodeParse}>
                  {codeState?.status === 'enhanced' ? 'Re-analyze' : 'Analyze & Enhance'}
                </button>
                <button
                  className="lp-upload-action ghost"
                  onClick={onCodeApply}
                  disabled={!codeState?.proposedComponents?.length}
                >
                  Apply to Canvas
                </button>
                <button className="lp-upload-discard" onClick={onCodeDiscard}>Discard code</button>
              </div>
            ) : null}
          </section>
        )}

        {mode === 'upload' && (
          <section className="lp-section">
            <div className="lp-section-head">
              <h3>Upload Screenshot</h3>
              <span>Reference → Rebuild</span>
            </div>

            <input
              ref={uploadRef}
              type="file"
              accept="image/png,image/jpeg,image/jpg"
              className="lp-upload-input"
              onChange={(event) => {
                const file = event.target.files?.[0]
                if (!file) return
                onScreenshotUpload(file)
                event.target.value = ''
              }}
            />

            <button className="lp-upload-btn" onClick={() => uploadRef.current?.click()}>
              🖼 Upload Screenshot
            </button>

            {hasScreenshot ? (
              <div className="lp-upload-state">
                <p className="lp-upload-name">{screenshotState.fileName}</p>
                <p className="lp-upload-meta">{screenshotState.width}×{screenshotState.height}</p>
                <p className="lp-upload-step">
                  {screenshotState.phase === 'lift'
                    ? 'Phase 2: Semantic Lift (optional)'
                    : 'Phase 1: Visual Clone ready'}
                </p>

                <div className="lp-upload-actions">
                  <button className="lp-upload-action" onClick={onScreenshotApply} disabled={!screenshotState.proposedComponents?.length}>Apply Cloned UI</button>
                  <button className="lp-upload-action ghost" onClick={onScreenshotAnalyze}>
                    {screenshotState.phase === 'lift' ? 'Back to Clone Mode' : 'Open Semantic Lift'}
                  </button>
                </div>

                <button className="lp-upload-discard" onClick={onScreenshotDiscard}>Discard screenshot</button>
              </div>
            ) : (
              <div className="lp-upload-empty">
                <p>Upload a screenshot to create a pixel-accurate visual clone first. Semantic lift is optional.</p>
              </div>
            )}
          </section>
        )}

        {mode === 'templates' && (
          <section className="lp-section">
            <div className="lp-section-head">
              <h3>Template Library</h3>
              <span>{visibleTemplates.length} results</span>
            </div>

            <div className="lp-cat-pills">
              {TEMPLATE_CATEGORIES.map(cat => (
                <button
                  key={cat}
                  className={`lp-cat-pill ${category === cat ? 'active' : ''}`}
                  onClick={() => setCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="lp-tpl-list">
              {visibleTemplates.map(template => (
                <button
                  key={template.id}
                  className="lp-tpl-card"
                  onClick={() => onTemplateSelect(template.id)}
                  title={template.description}
                >
                  <div className="lp-tpl-preview"><TemplateMiniPreview components={template.components} /></div>
                  <div className="lp-tpl-meta">
                    <div>
                      <p className="lp-tpl-name">{template.label}</p>
                      <p className="lp-tpl-desc">{template.description}</p>
                    </div>
                    <span className="lp-tpl-arrow">→</span>
                  </div>
                </button>
              ))}
            </div>
          </section>
        )}

        {mode === 'components' && (
          <section className="lp-section">
            <div className="lp-section-head">
              <h3>UI Components</h3>
              <span>Drag to canvas</span>
            </div>

            <div className="lp-comp-grid">
              {PUBLIC_COMPONENT_TYPES.map(type => (
                <div
                  key={type}
                  className={`lp-comp-tile ${draggingType === type ? 'dragging' : ''}`}
                  style={{ '--accent': TYPE_ACCENT[type] }}
                  draggable
                  onDragStart={event => handleDragStart(event, type)}
                  onDragEnd={handleDragEnd}
                >
                  <div className="lp-comp-preview">{componentPreview(type)}</div>
                  <div className="lp-comp-meta">
                    <span className="lp-comp-name">{type}</span>
                    <span className="lp-comp-drag">Drag</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {mode === 'styles' && (
          <section className="lp-section">
            <div className="lp-section-head">
              <h3>Style Vibes</h3>
              <span>One click apply</span>
            </div>

            <div className="lp-style-grid">
              {STYLE_CARDS.map(card => {
                const isActive = appliedPrompt === card.prompt
                return (
                  <button
                    key={card.key}
                    className={`lp-style-card ${isActive ? 'active' : ''}`}
                    onClick={() => onStyleSelect(card.prompt)}
                    style={{
                      '--sc-bg': card.colors[0],
                      '--sc-card': card.colors[1],
                      '--sc-accent': card.colors[2],
                      '--sc-radius': `${card.radius}px`,
                    }}
                  >
                    <div className="lp-sc-preview">
                      <div className="lp-sc-surface">
                        <div className="lp-sc-widget">
                          <div className="lp-sc-heading" style={{ color: card.colors[2] }} />
                          <div className="lp-sc-body" style={{ color: '#64748b' }} />
                          <div className="lp-sc-btn">Go</div>
                        </div>
                      </div>
                    </div>
                    <div className="lp-sc-footer">
                      <span>{card.label}</span>
                      {isActive && <span className="lp-sc-check">Applied</span>}
                    </div>
                  </button>
                )
              })}
            </div>
          </section>
        )}

        {mode === 'layouts' && (
          <section className="lp-section">
            <div className="lp-section-head">
              <h3>Layout Blocks</h3>
              <span>Preset structures</span>
            </div>

            <div className="lp-layout-list">
              {LAYOUT_CARDS.map(layout => (
                <button key={layout.id} className="lp-layout-card" onClick={() => handleLayoutClick(layout.id)}>
                  <div className="lp-layout-diagram" style={{ background: layout.colors[0] }}>
                    {layout.id === 'layout-hero' && <>
                      <span className="ld-nav" style={{ background: layout.colors[0] }} />
                      <span className="ld-hero" style={{ background: `linear-gradient(135deg, ${layout.colors[0]}, ${layout.colors[1]})` }} />
                    </>}
                    {layout.id === 'layout-two-col' && <>
                      <span className="ld-nav" style={{ background: layout.colors[0] }} />
                      <div className="ld-cols">
                        <span className="ld-col" style={{ background: layout.colors[1] }} />
                        <span className="ld-col" style={{ background: layout.colors[1] }} />
                      </div>
                    </>}
                    {layout.id === 'layout-grid' && <>
                      <span className="ld-nav" style={{ background: layout.colors[0] }} />
                      <div className="ld-grid">
                        <span className="ld-cell" style={{ background: layout.colors[1] }} />
                        <span className="ld-cell" style={{ background: layout.colors[1] }} />
                        <span className="ld-cell" style={{ background: layout.colors[1] }} />
                        <span className="ld-cell" style={{ background: layout.colors[1] }} />
                      </div>
                    </>}
                    {layout.id === 'layout-app' && <>
                      <span className="ld-nav" style={{ background: layout.colors[0] }} />
                      <div className="ld-cols">
                        <span className="ld-col" style={{ background: layout.colors[1] }} />
                        <span className="ld-col" style={{ background: layout.colors[1] }} />
                        <span className="ld-col" style={{ background: layout.colors[1] }} />
                      </div>
                    </>}
                    {layout.id === 'layout-single' && <div className="ld-center" style={{ background: `linear-gradient(135deg, ${layout.colors[0]}22, ${layout.colors[1]}22)` }}>
                      <span className="ld-card" style={{ background: layout.colors[1] }} />
                    </div>}
                  </div>
                  <div className="lp-layout-meta">
                    <p>{layout.label}</p>
                    <small>{layout.desc}</small>
                  </div>
                  <span className="lp-layout-arrow">→</span>
                </button>
              ))}
            </div>
          </section>
        )}
      </div>
    </aside>
  )
}
