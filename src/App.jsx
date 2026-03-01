import { useMemo, useState } from 'react'
import './App.css'
import { DrawingCanvas } from './components/DrawingCanvas'
import { PreviewPanel }   from './components/PreviewPanel'
import { ComponentList }  from './components/ComponentList'
import { interpretSketchObjects, defaultsForType } from './lib/shapeInterpreter'
import { refineComponentsWithPrompt, PRESETS }     from './lib/copilot'
import { generateReactCode }                        from './lib/codeGenerator'
import { TYPE_ACCENT }                              from './lib/componentModel'
import { loadMemory, getDominantProfile, clearMemory } from './lib/intentEngine'

// ─── file download helper ─────────────────────────────────────────────────────
function downloadText(filename, text) {
  const a = document.createElement('a')
  a.href = URL.createObjectURL(new Blob([text], { type: 'text/plain' }))
  a.download = filename
  a.click()
  URL.revokeObjectURL(a.href)
}

export default function App() {
  const [sketchObjects,  setSketchObjects]  = useState([])
  const [typeOverrides,  setTypeOverrides]  = useState({})   // { [id]: type }
  const [draftPrompt,    setDraftPrompt]    = useState('')
  const [appliedPrompt,  setAppliedPrompt]  = useState('')
  const [copilotHistory, setCopilotHistory] = useState([]) // undo stack
  const [copyState,      setCopyState]      = useState('')
  const [activeTab,      setActiveTab]      = useState('preview') // 'preview' | 'code'
  const [codeSubTab,     setCodeSubTab]     = useState('combined') // 'jsx' | 'css' | 'theme' | 'combined'
  const [memoryVersion,  setMemoryVersion]  = useState(0) // bumped to invalidate memory cache

  // Reload preference memory whenever the user applies a new prompt or clears history
  const memory = useMemo(() => loadMemory(), [appliedPrompt, memoryVersion]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── 1. Interpret raw sketch objects ────────────────────────────────────────
  const interpreted = useMemo(
    () => {
      const base = interpretSketchObjects(sketchObjects)
      // Apply user-chosen type overrides
      return base.map((c, i) => {
        const overriddenType = typeOverrides[c.id]
        if (!overriddenType || overriddenType === c.type) return c
        return {
          ...c,
          type:  overriddenType,
          props: defaultsForType(overriddenType, i),
        }
      })
    },
    [sketchObjects, typeOverrides],
  )

  // ── 2. Apply Copilot style profile ─────────────────────────────────────────
  const { components, profile, changeSummary } = useMemo(
    () => refineComponentsWithPrompt(interpreted, appliedPrompt),
    [interpreted, appliedPrompt],
  )

  // ── 3. Generate code + design tokens ────────────────────────────────────────
  const { jsx, css, themeJs, combined } = useMemo(
    () => generateReactCode(components, profile),
    [components, profile],
  )

  // ── 4. Canvas overlays: highlight each object with its detected type ───────
  const componentOverlays = useMemo(
    () => interpreted.map(c => ({
      id:     c.id,
      x:      c.x,
      y:      c.y,
      width:  c.width,
      height: c.height,
      type:   c.type,
      color:  TYPE_ACCENT[c.type] ?? '#6366f1',
    })),
    [interpreted],
  )

  // ── Actions ────────────────────────────────────────────────────────────────
  const applyPrompt = () => {
    const trimmed = draftPrompt.trim()
    if (trimmed === appliedPrompt) return          // nothing changed — don't stack
    setCopilotHistory(h => [...h, appliedPrompt]) // push current to undo stack
    setAppliedPrompt(trimmed)
  }
  const resetPrompt = () => {
    setCopilotHistory([])
    setDraftPrompt('')
    setAppliedPrompt('')
  }
  const pickPreset = (p) => {
    if (p === appliedPrompt) return
    setCopilotHistory(h => [...h, appliedPrompt])
    setDraftPrompt(p)
    setAppliedPrompt(p)
  }
  const undoCopilot = () => {
    if (!copilotHistory.length) return
    const prev = copilotHistory[copilotHistory.length - 1]
    setCopilotHistory(h => h.slice(0, -1))
    setAppliedPrompt(prev)
    setDraftPrompt(prev)
  }

  const copyCode = async () => {
    const toCopy =
      codeSubTab === 'jsx'   ? jsx :
      codeSubTab === 'css'   ? css :
      codeSubTab === 'theme' ? themeJs : combined
    await navigator.clipboard.writeText(toCopy).catch(() => {})
    setCopyState('Copied!')
    setTimeout(() => setCopyState(''), 1800)
  }

  const copyJsx = async () => {
    await navigator.clipboard.writeText(jsx).catch(() => {})
    setCopyState('jsx')
    setTimeout(() => setCopyState(''), 1800)
  }

  const copyCss = async () => {
    await navigator.clipboard.writeText(css).catch(() => {})
    setCopyState('css')
    setTimeout(() => setCopyState(''), 1800)
  }

  const downloadFiles = () => {
    downloadText('GeneratedUI.jsx', jsx)
    setTimeout(() => downloadText('generatedStyles.css', css), 250)
    setTimeout(() => downloadText('theme.js', themeJs), 500)
  }

  const dominantProfile = getDominantProfile(memory)
  const sessionCount    = memory?.sessionCount ?? 0

  const handleClearMemory = () => {
    clearMemory()
    setMemoryVersion(v => v + 1)
  }

  const handleOverride = (id, newType) =>
    setTypeOverrides(p => ({ ...p, [id]: newType }))

  // ─── render ────────────────────────────────────────────────────────────────
  return (
    <div className="app-shell">

      {/* ── Top bar ───────────────────────────────────────────────────────── */}
      <header className="topbar">
        <div className="topbar-brand">
          <span className="brand-icon">✦</span>
          <span className="brand-name">Lume</span>
          <span className="brand-tag">Sketch → React</span>
        </div>
        <div className="topbar-meta">
          <span className="meta-chip">{components.length} component{components.length !== 1 ? 's' : ''}</span>
          {appliedPrompt && (
            <span className="meta-chip mood-chip">✨ {profile.mood}</span>
          )}
          {dominantProfile && sessionCount >= 2 && (
            <span className="meta-chip memory-chip" title="Your most-used style preference">
              🧠 {dominantProfile}
            </span>
          )}
        </div>
      </header>

      {/* ── Main workspace ────────────────────────────────────────────────── */}
      <div className="workspace">

        {/* Left: Canvas */}
        <section className="pane pane-canvas">
          <div className="pane-header">
            <span className="pane-label">1 · Drawing Canvas</span>
            <span className="pane-hint">Freehand or use the shape tools</span>
          </div>
          <DrawingCanvas
            onObjectsChange={setSketchObjects}
            componentOverlays={componentOverlays}
          />
        </section>

        {/* Right: tabbed Preview / Code */}
        <section className="pane pane-right">
          <div className="pane-header tab-header">
            <div className="tab-row">
              <button
                className={`tab-btn ${activeTab === 'preview' ? 'active' : ''}`}
                onClick={() => setActiveTab('preview')}
              >
                2 · Live Preview
              </button>
              <button
                className={`tab-btn ${activeTab === 'code' ? 'active' : ''}`}
                onClick={() => setActiveTab('code')}
              >
                4 · Generated Code
              </button>
            </div>
            {activeTab === 'code' && (
              <div className="code-header-right">
                {/* Sub-tabs: JSX / CSS / Combined */}
                <div className="code-subtab-row">
                  {['combined', 'jsx', 'css', 'theme'].map(t => (
                    <button
                      key={t}
                      className={`code-subtab-btn ${codeSubTab === t ? 'active' : ''}`}
                      onClick={() => setCodeSubTab(t)}
                    >
                      {t === 'combined' ? 'All' : t === 'theme' ? 'Tokens' : t.toUpperCase()}
                    </button>
                  ))}
                </div>
                <div className="code-actions">
                  <button className="action-btn" onClick={copyCode}>
                    {copyState || '📋 Copy'}
                  </button>
                  <button className="action-btn ghost" onClick={downloadFiles}>
                    ⬇ Download
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="pane-body">
            {activeTab === 'preview' ? (
              <PreviewPanel components={components} profile={profile} />
            ) : (
              <div className="code-pane-body">
                {/* Export file-tree preview */}
                {components.length > 0 && (
                  <div className="export-preview">
                    {[
                      { icon: '📄', name: 'GeneratedUI.jsx',      content: jsx,     copyKey: 'jsx',   copyFn: copyJsx },
                      { icon: '🎨', name: 'generatedStyles.css',  content: css,     copyKey: 'css',   copyFn: copyCss },
                      { icon: '💳', name: 'theme.js',              content: themeJs, copyKey: 'theme', copyFn: () => { navigator.clipboard.writeText(themeJs); setCopyState('theme'); setTimeout(() => setCopyState(''), 1800) } },
                    ].map(({ icon, name, content, copyKey, copyFn }) => (
                      <div key={name} className="export-file-row">
                        <span className="export-file-icon">{icon}</span>
                        <span className="export-file-name">{name}</span>
                        <span className="export-file-lines">{content.split('\n').length} lines</span>
                        <button className="export-file-btn" onClick={copyFn}>
                          {copyState === copyKey ? '✓' : 'Copy'}
                        </button>
                        <button className="export-file-btn" onClick={() => downloadText(name, content)}>↓</button>
                      </div>
                    ))}
                  </div>
                )}
                <textarea
                  className="code-area"
                  value={
                    codeSubTab === 'jsx'   ? jsx   :
                    codeSubTab === 'css'   ? css   :
                    codeSubTab === 'theme' ? themeJs : combined
                  }
                  readOnly
                  spellCheck={false}
                />
              </div>
            )}
          </div>
        </section>
      </div>

      {/* ── Bottom strip: Copilot + Component list ────────────────────────── */}
      <div className="bottom-strip">

        {/* Copilot panel */}
        <section className="bottom-pane copilot-pane">
          <div className="copilot-pane-header">
            <span className="pane-label">3 · AI Copilot</span>
            {dominantProfile && sessionCount >= 3 && (
              <span className="taste-hint">
                🧠 You tend to prefer <strong>{dominantProfile}</strong>
                <button className="taste-hint-clear" onClick={handleClearMemory} title="Clear preference history">×</button>
              </span>
            )}
          </div>
          <p className="pane-hint">Choose a preset or describe the feeling you want</p>

          <div className="preset-chips">
            {PRESETS.map(({ label, prompt }) => (
              <button
                key={label}
                className={`chip ${appliedPrompt === prompt ? 'chip-active' : ''}`}
                onClick={() => pickPreset(prompt)}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="copilot-input-row">
            <input
              className="copilot-input"
              value={draftPrompt}
              onChange={e => setDraftPrompt(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && applyPrompt()}
              placeholder="describe a feeling, reference a brand, or use a color mood…"
            />
            <button className="action-btn" onClick={applyPrompt}>Apply ↵</button>
            {copilotHistory.length > 0 && (
              <button className="action-btn ghost" onClick={undoCopilot} title="Undo last style change">
                ↩ Undo
              </button>
            )}
            {appliedPrompt && !copilotHistory.length && (
              <button className="action-btn ghost" onClick={resetPrompt}>✕ Reset</button>
            )}
          </div>

          {changeSummary && (
            <div className="copilot-summary">
              <span className="copilot-summary-icon">✦</span>
              {changeSummary}
            </div>
          )}
        </section>

        {/* Component list panel */}
        <section className="bottom-pane list-pane">
          <div className="pane-label">5 · Component Inspector</div>
          <p className="pane-hint">Override the detected type for any shape</p>
          <ComponentList
            components={interpreted}
            overrides={typeOverrides}
            onOverride={handleOverride}
          />
        </section>
      </div>
    </div>
  )
}
