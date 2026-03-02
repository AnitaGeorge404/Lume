import { useMemo, useRef, useState } from 'react'
import { TEMPLATES } from '../lib/templates'
import { COMPONENT_TYPES, TYPE_ACCENT } from '../lib/componentModel'
import './LeftPanel.css'

const MODES = [
  { id: 'draw', icon: '✏︎', label: 'Draw' },
  { id: 'upload', icon: '🖼', label: 'Upload' },
  { id: 'templates', icon: '◫', label: 'Templates' },
  { id: 'components', icon: '◧', label: 'Parts' },
  { id: 'styles', icon: '✦', label: 'Styles' },
  { id: 'layouts', icon: '▦', label: 'Layouts' },
]

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
  'ecommerce-home': ['All', 'Featured', 'Store'],
  'portfolio-studio': ['All', 'Featured', 'Landing'],
  'business-site': ['All', 'Landing'],
  'app-analytics': ['All', 'Featured', 'App'],
  'booking-flow': ['All', 'Forms'],
  'survey-quiz': ['All', 'Forms'],
}

const LAYOUT_CARDS = [
  { id: 'layout-hero', label: 'Hero + CTA', desc: 'Header, lead form, CTA' },
  { id: 'layout-two-col', label: 'Two Column', desc: 'Balanced content split' },
  { id: 'layout-grid', label: 'Feature Grid', desc: 'Four card grid layout' },
  { id: 'layout-app', label: 'App Dashboard', desc: 'Top nav + metric cards' },
  { id: 'layout-single', label: 'Single Focus', desc: 'Centered conversion flow' },
]

function buildLayoutComponents(layoutId) {
  const style = {
    button: { fill: '#2563eb', text: '#ffffff', border: '#1d4ed8', radius: 12, shadow: true },
    buttonGhost: { fill: '#ffffff', text: '#1d4ed8', border: '#93c5fd', radius: 12, shadow: false },
    card: { fill: '#ffffff', text: '#0f172a', border: '#e2e8f0', radius: 16, shadow: true },
    input: { fill: '#f8fafc', text: '#334155', border: '#cbd5e1', radius: 12, shadow: false },
    slider: { fill: '#e0f2fe', text: '#075985', border: '#0ea5e9', radius: 10, shadow: false },
    divider: { fill: 'transparent', text: '#94a3b8', border: '#e2e8f0', radius: 0, shadow: false },
    badge: { fill: '#eff6ff', text: '#1e3a8a', border: '#93c5fd', radius: 999, shadow: false },
  }

  const t = (id, type, x, y, width, height, styleKey, props) => ({
    id,
    type,
    x,
    y,
    width,
    height,
    style: style[styleKey] ?? style.button,
    props,
    sourceShape: `layout_${type.toLowerCase()}`,
    source: 'template',
  })

  if (layoutId === 'layout-hero') {
    return [
      t('ly-hero-title', 'Card', 30, 24, 700, 140, 'card', { title: 'Build and launch in days', body: 'Generate production-ready React UI from rough ideas.' }),
      t('ly-hero-badge', 'Badge', 48, 44, 96, 30, 'badge', { label: 'NEW' }),
      t('ly-hero-input', 'Input', 48, 188, 460, 48, 'input', { placeholder: 'Enter your work email' }),
      t('ly-hero-btn', 'Button', 526, 188, 204, 48, 'button', { label: 'Start free trial' }),
      t('ly-hero-div', 'Divider', 30, 258, 700, 2, 'divider', { label: '' }),
      t('ly-hero-card-a', 'Card', 30, 280, 224, 150, 'card', { title: 'Auto Layouts', body: 'Generate sensible responsive blocks.' }),
      t('ly-hero-card-b', 'Card', 268, 280, 224, 150, 'card', { title: 'Styled Components', body: 'Polished visual defaults included.' }),
      t('ly-hero-card-c', 'Card', 506, 280, 224, 150, 'card', { title: 'Code Export', body: 'Ship JSX + CSS instantly.' }),
    ]
  }

  if (layoutId === 'layout-two-col') {
    return [
      t('ly-2c-nav', 'Card', 20, 20, 720, 64, 'card', { title: 'Product Studio', body: 'Design system and components' }),
      t('ly-2c-left', 'Card', 20, 102, 350, 330, 'card', { title: 'Left content', body: 'Long-form details, docs, and copy.' }),
      t('ly-2c-right', 'Card', 390, 102, 350, 330, 'card', { title: 'Right content', body: 'CTA, highlights, and testimonials.' }),
      t('ly-2c-btn-a', 'Button', 44, 372, 138, 42, 'button', { label: 'Get started' }),
      t('ly-2c-btn-b', 'Button', 194, 372, 138, 42, 'buttonGhost', { label: 'Learn more' }),
    ]
  }

  if (layoutId === 'layout-grid') {
    return [
      t('ly-grd-title', 'Card', 20, 20, 720, 84, 'card', { title: 'Everything your team needs', body: 'All core modules in one place.' }),
      t('ly-grd-a', 'Card', 20, 120, 350, 150, 'card', { title: 'Analytics', body: 'KPIs and trends in real-time.' }),
      t('ly-grd-b', 'Card', 390, 120, 350, 150, 'card', { title: 'Automations', body: 'Reduce repetitive workflows.' }),
      t('ly-grd-c', 'Card', 20, 284, 350, 150, 'card', { title: 'Collaboration', body: 'Comment, approve, and track work.' }),
      t('ly-grd-d', 'Card', 390, 284, 350, 150, 'card', { title: 'Security', body: 'Role controls and audit logs.' }),
    ]
  }

  if (layoutId === 'layout-app') {
    return [
      t('ly-app-nav', 'Card', 0, 0, 760, 62, 'card', { title: 'Revenue Dashboard', body: '' }),
      t('ly-app-div', 'Divider', 0, 62, 760, 2, 'divider', { label: '' }),
      t('ly-app-m1', 'Card', 20, 82, 230, 118, 'card', { title: 'MRR', body: '$92,400' }),
      t('ly-app-m2', 'Card', 265, 82, 230, 118, 'card', { title: 'Churn', body: '2.1%' }),
      t('ly-app-m3', 'Card', 510, 82, 230, 118, 'card', { title: 'Expansion', body: '+18.4%' }),
      t('ly-app-sl', 'Slider', 20, 220, 474, 44, 'slider', { label: 'Forecast confidence', value: 72, min: 0, max: 100 }),
      t('ly-app-search', 'Input', 20, 286, 474, 46, 'input', { placeholder: 'Search accounts…' }),
      t('ly-app-btn', 'Button', 510, 286, 230, 46, 'button', { label: 'Create report' }),
      t('ly-app-list', 'Card', 20, 348, 720, 112, 'card', { title: 'Recent activity', body: '5 new opportunities created today.' }),
    ]
  }

  if (layoutId === 'layout-single') {
    return [
      t('ly-sing-wrap', 'Card', 140, 34, 480, 230, 'card', { title: 'Book a demo', body: 'See how teams ship polished UI faster.' }),
      t('ly-sing-email', 'Input', 184, 168, 392, 46, 'input', { placeholder: 'Work email' }),
      t('ly-sing-btn', 'Button', 298, 230, 164, 44, 'button', { label: 'Continue' }),
      t('ly-sing-foot', 'Card', 140, 286, 480, 150, 'card', { title: 'Trusted by teams', body: 'Over 3,000 teams use Lume weekly.' }),
    ]
  }

  return []
}

function componentPreview(type) {
  const accent = TYPE_ACCENT[type] ?? '#6366f1'

  if (type === 'Button') {
    return (
      <svg viewBox="0 0 112 56" className="comp-preview-svg">
        <defs>
          <linearGradient id="btnGrad" x1="0" x2="1">
            <stop offset="0%" stopColor={accent} />
            <stop offset="100%" stopColor="#4338ca" />
          </linearGradient>
        </defs>
        <rect x="8" y="14" width="96" height="30" rx="10" fill="url(#btnGrad)" />
        <rect x="42" y="26" width="28" height="6" rx="3" fill="rgba(255,255,255,0.92)" />
      </svg>
    )
  }

  if (type === 'Card') {
    return (
      <svg viewBox="0 0 112 56" className="comp-preview-svg">
        <rect x="8" y="6" width="96" height="44" rx="10" fill="#ffffff" stroke="#dbe3ef" />
        <rect x="18" y="16" width="40" height="6" rx="3" fill="#0f172a" opacity="0.85" />
        <rect x="18" y="28" width="76" height="5" rx="2.5" fill="#64748b" opacity="0.35" />
        <rect x="18" y="37" width="62" height="5" rx="2.5" fill="#94a3b8" opacity="0.28" />
      </svg>
    )
  }

  if (type === 'Slider') {
    return (
      <svg viewBox="0 0 112 56" className="comp-preview-svg">
        <rect x="10" y="24" width="92" height="8" rx="4" fill="#dbeafe" />
        <rect x="10" y="24" width="58" height="8" rx="4" fill={accent} />
        <circle cx="68" cy="28" r="8" fill="#ffffff" stroke={accent} strokeWidth="2" />
      </svg>
    )
  }

  if (type === 'Input') {
    return (
      <svg viewBox="0 0 112 56" className="comp-preview-svg">
        <rect x="8" y="14" width="96" height="28" rx="9" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1.4" />
        <rect x="20" y="25" width="36" height="5" rx="2.5" fill="#94a3b8" opacity="0.55" />
        <rect x="20" y="22" width="1.8" height="12" rx="1" fill={accent} />
      </svg>
    )
  }

  if (type === 'Badge') {
    return (
      <svg viewBox="0 0 112 56" className="comp-preview-svg">
        <rect x="30" y="18" width="52" height="20" rx="10" fill={`${accent}24`} />
        <rect x="30" y="18" width="52" height="20" rx="10" fill="none" stroke={accent} />
        <rect x="46" y="26" width="20" height="4" rx="2" fill={accent} />
      </svg>
    )
  }

  return (
    <svg viewBox="0 0 112 56" className="comp-preview-svg">
      <line x1="8" y1="28" x2="104" y2="28" stroke="#d6deea" strokeWidth="2" />
      <rect x="44" y="22" width="24" height="12" rx="6" fill="#ffffff" stroke="#cbd5e1" />
    </svg>
  )
}

function templateVisualConfig(templateId) {
  const map = {
    blank: { bgA: '#f8fafc', bgB: '#eef2f7', tint: '#e2e8f0' },
    'landing-saas': { bgA: '#fff7ed', bgB: '#fde68a', tint: '#ea580c' },
    'ecommerce-home': { bgA: '#fdf2f8', bgB: '#fbcfe8', tint: '#be123c' },
    'portfolio-studio': { bgA: '#dcfce7', bgB: '#bbf7d0', tint: '#166534' },
    'business-site': { bgA: '#dbeafe', bgB: '#bfdbfe', tint: '#1d4ed8' },
    'app-analytics': { bgA: '#e0f2fe', bgB: '#bae6fd', tint: '#0369a1' },
    'booking-flow': { bgA: '#f5f3ff', bgB: '#ddd6fe', tint: '#6d28d9' },
    'survey-quiz': { bgA: '#ecfeff', bgB: '#cffafe', tint: '#0e7490' },
  }
  return map[templateId] ?? map.blank
}

function templateThumbnail(template) {
  const { bgA, bgB, tint } = templateVisualConfig(template.id)
  const sx = 290 / 760
  const sy = 164 / 480

  return (
    <svg viewBox="0 0 290 164" className="tpl-thumb">
      <defs>
        <linearGradient id={`tpl-bg-${template.id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={bgA} />
          <stop offset="100%" stopColor={bgB} />
        </linearGradient>
      </defs>

      <rect x="0" y="0" width="290" height="164" rx="14" fill="url(#tpl-bg-${template.id})" />
      <rect x="12" y="12" width="266" height="18" rx="9" fill="rgba(255,255,255,0.88)" />
      <circle cx="25" cy="21" r="2.4" fill="#cbd5e1" />
      <circle cx="34" cy="21" r="2.4" fill="#cbd5e1" />
      <circle cx="43" cy="21" r="2.4" fill="#cbd5e1" />

      <rect x="22" y="42" width="130" height="8" rx="4" fill={tint} opacity="0.9" />
      <rect x="22" y="55" width="164" height="6" rx="3" fill="#334155" opacity="0.28" />

      {template.components.slice(0, 15).map((component, index) => {
        const x = Math.round(component.x * sx) + 12
        const y = Math.round(component.y * sy) + 8
        const width = Math.max(10, Math.round(component.width * sx))
        const height = Math.max(5, Math.round(component.height * sy))

        const fill = component.type === 'Button'
          ? component.style.fill
          : component.type === 'Input'
            ? '#ffffff'
            : component.type === 'Divider'
              ? '#dbe3ef'
              : component.style.fill

        const stroke = component.type === 'Divider' ? 'none' : component.style.border
        const rx = component.type === 'Badge' ? 999 : Math.max(2, Math.round((component.style.radius ?? 10) * 0.45))

        return (
          <g key={`${template.id}-${component.id}-${index}`}>
            <rect
              x={x}
              y={y}
              width={width}
              height={component.type === 'Divider' ? Math.max(2, Math.round(height * 0.3)) : height}
              rx={rx}
              fill={fill}
              stroke={stroke}
              strokeWidth="0.8"
              opacity={component.type === 'Divider' ? 0.8 : 0.96}
            />
            {component.type === 'Button' && (
              <rect x={x + 6} y={y + Math.max(3, Math.round(height * 0.35))} width={Math.max(10, Math.round(width * 0.45))} height="3" rx="1.5" fill="rgba(255,255,255,0.88)" />
            )}
            {component.type === 'Input' && (
              <rect x={x + 6} y={y + Math.max(3, Math.round(height * 0.34))} width={Math.max(10, Math.round(width * 0.35))} height="3" rx="1.5" fill="#94a3b8" opacity="0.5" />
            )}
            {component.type === 'Card' && (
              <>
                <rect x={x + 6} y={y + 6} width={Math.max(12, Math.round(width * 0.4))} height="3" rx="1.5" fill="#0f172a" opacity="0.6" />
                <rect x={x + 6} y={y + 13} width={Math.max(12, Math.round(width * 0.6))} height="2.5" rx="1.25" fill="#64748b" opacity="0.35" />
              </>
            )}
          </g>
        )
      })}
    </svg>
  )
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
}) {
  const [mode, setMode] = useState('templates')
  const [category, setCategory] = useState('Featured')
  const [draggingType, setDraggingType] = useState(null)
  const uploadRef = useRef(null)

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
                <p className="lp-upload-step">Step 2: Analyze + Enhance</p>

                <div className="lp-upload-actions">
                  <button className="lp-upload-action" onClick={onScreenshotAnalyze}>Analyze & Enhance</button>
                  <button className="lp-upload-action ghost" onClick={onScreenshotApply} disabled={!screenshotState.proposedComponents?.length}>Apply Enhanced UI</button>
                </div>

                <button className="lp-upload-discard" onClick={onScreenshotDiscard}>Discard screenshot</button>
              </div>
            ) : (
              <div className="lp-upload-empty">
                <p>Add a screenshot and Lume will reconstruct it using modern, cleaner components.</p>
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
                  <div className="lp-tpl-preview">{templateThumbnail(template)}</div>
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
              {COMPONENT_TYPES.map(type => (
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
                          <div className="lp-sc-line lg" />
                          <div className="lp-sc-line sm" />
                          <div className="lp-sc-btn" />
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
                  <div className="lp-layout-diagram">
                    <span className="bar" />
                    <span className="box" />
                    <span className="box" />
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
