import { useMemo, useState } from 'react'
import './App.css'
import { DrawingCanvas }   from './components/DrawingCanvas'
import { LeftPanel }       from './components/LeftPanel'
import { RightPanel }      from './components/RightPanel'
import { CanvasDropZone }  from './components/CanvasDropZone'
import { createComponentFromSketch, getSketchSuggestions, defaultsForType } from './lib/shapeInterpreter'
import { refineComponentsWithPrompt }              from './lib/copilot'
import { generateReactCode }                       from './lib/codeGenerator'
import { TYPE_ACCENT }                             from './lib/componentModel'
import { loadMemory, getDominantProfile, clearMemory } from './lib/intentEngine'
import { cloneTemplate }                           from './lib/templates'

// ─── helpers ─────────────────────────────────────────────────────────────────
function downloadText(filename, text) {
  const a = document.createElement('a')
  a.href = URL.createObjectURL(new Blob([text], { type: 'text/plain' }))
  a.download = filename
  a.click()
  URL.revokeObjectURL(a.href)
}

function intersects(a, b) {
  const ax2 = a.x + a.width
  const ay2 = a.y + a.height
  const bx2 = b.x + b.width
  const by2 = b.y + b.height
  return !(ax2 < b.x || bx2 < a.x || ay2 < b.y || by2 < a.y)
}

function SuggestionVisual({ type }) {
  if (type === 'keep') {
    return (
      <svg viewBox="0 0 88 54" className="sg-card-svg">
        <rect x="6" y="8" width="76" height="38" rx="10" fill="#ffffff" stroke="#dbe4f0" strokeWidth="1.5" />
        <path d="M20 30c6-12 12 12 19 0 8-12 14 12 24-1" stroke="#334155" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      </svg>
    )
  }

  if (type === 'Button') {
    return (
      <svg viewBox="0 0 88 54" className="sg-card-svg">
        <rect x="10" y="14" width="68" height="26" rx="9" fill="#2563eb" />
        <rect x="30" y="24" width="28" height="6" rx="3" fill="rgba(255,255,255,0.9)" />
      </svg>
    )
  }

  if (type === 'Card') {
    return (
      <svg viewBox="0 0 88 54" className="sg-card-svg">
        <rect x="8" y="7" width="72" height="40" rx="9" fill="#ffffff" stroke="#dbe4f0" strokeWidth="1.5" />
        <rect x="16" y="16" width="32" height="5" rx="2.5" fill="#0f172a" opacity="0.75" />
        <rect x="16" y="26" width="54" height="4" rx="2" fill="#94a3b8" opacity="0.45" />
      </svg>
    )
  }

  if (type === 'Input') {
    return (
      <svg viewBox="0 0 88 54" className="sg-card-svg">
        <rect x="8" y="15" width="72" height="24" rx="8" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1.5" />
        <rect x="17" y="25" width="28" height="4" rx="2" fill="#94a3b8" opacity="0.6" />
      </svg>
    )
  }

  if (type === 'Slider') {
    return (
      <svg viewBox="0 0 88 54" className="sg-card-svg">
        <rect x="10" y="25" width="68" height="6" rx="3" fill="#dbeafe" />
        <rect x="10" y="25" width="40" height="6" rx="3" fill="#0284c7" />
        <circle cx="50" cy="28" r="7" fill="#ffffff" stroke="#0284c7" strokeWidth="2" />
      </svg>
    )
  }

  if (type === 'Badge') {
    return (
      <svg viewBox="0 0 88 54" className="sg-card-svg">
        <rect x="22" y="18" width="44" height="18" rx="9" fill="#eff6ff" stroke="#93c5fd" />
        <rect x="34" y="25" width="20" height="4" rx="2" fill="#1d4ed8" />
      </svg>
    )
  }

  return (
    <svg viewBox="0 0 88 54" className="sg-card-svg">
      <line x1="10" y1="27" x2="78" y2="27" stroke="#dbe4f0" strokeWidth="2" />
      <rect x="34" y="21" width="20" height="12" rx="6" fill="#ffffff" stroke="#dbe4f0" />
    </svg>
  )
}

const COMP_DEFAULT_SIZES = {
  Button:  { w: 140, h: 44 },
  Card:    { w: 280, h: 160 },
  Slider:  { w: 280, h: 44 },
  Input:   { w: 240, h: 48 },
  Badge:   { w: 72,  h: 32 },
  Divider: { w: 360, h: 4  },
}

const COMP_DEFAULT_STYLES = {
  Button:  { fill: '#2563eb', text: '#ffffff', border: '#1d4ed8', radius: 12,  shadow: true  },
  Card:    { fill: '#ffffff', text: '#0f172a', border: '#e2e8f0', radius: 16,  shadow: true  },
  Slider:  { fill: '#e0f2fe', text: '#075985', border: '#0284c7', radius: 10,  shadow: false },
  Input:   { fill: '#f8fafc', text: '#334155', border: '#cbd5e1', radius: 12,  shadow: false },
  Badge:   { fill: '#eff6ff', text: '#1e3a8a', border: '#93c5fd', radius: 999, shadow: false },
  Divider: { fill: 'transparent', text: '#94a3b8', border: '#e2e8f0', radius: 0, shadow: false },
}

// ─── App ─────────────────────────────────────────────────────────────────────
export default function App() {

  // ── Canvas state ─────────────────────────────────────────────────────────────
  const [sketchObjects,      setSketchObjects]      = useState([])
  const [typeOverrides,      setTypeOverrides]      = useState({})
  const [templateComponents, setTemplateComponents] = useState([])
  const [draggedComponents,  setDraggedComponents]  = useState([])
  const [drawnChoices,       setDrawnChoices]       = useState({})
  const [dismissedHints,     setDismissedHints]     = useState([])
  const [canvasKey,          setCanvasKey]          = useState(0)

  // ── Copilot state ─────────────────────────────────────────────────────────────
  const [draftPrompt,    setDraftPrompt]    = useState('')
  const [appliedPrompt,  setAppliedPrompt]  = useState('')
  const [copilotHistory, setCopilotHistory] = useState([])

  // ── UI state ──────────────────────────────────────────────────────────────────
  const [rightTab,       setRightTab]      = useState('preview')
  const [codeSubTab,     setCodeSubTab]    = useState('combined')
  const [copyState,      setCopyState]     = useState('')
  const [memoryVersion,  setMemoryVersion] = useState(0)

  // ── Memory ────────────────────────────────────────────────────────────────────
  const memory = useMemo(() => loadMemory(), [appliedPrompt, memoryVersion]) // eslint-disable-line react-hooks/exhaustive-deps

  const chosenDrawnComponents = useMemo(() => {
    const chosen = sketchObjects
      .filter(sketch => drawnChoices[sketch.id]?.kind === 'component')
      .map((sketch, index) => {
        const choice = drawnChoices[sketch.id]
        return createComponentFromSketch(sketch, choice.type, index)
      })

    return chosen
  }, [sketchObjects, drawnChoices])

  const activeSketch = useMemo(() => {
    const validDismissed = dismissedHints.filter(id => sketchObjects.some(s => s.id === id))
    return [...sketchObjects]
      .reverse()
      .find(s => !drawnChoices[s.id] && !validDismissed.includes(s.id)) ?? null
  }, [sketchObjects, drawnChoices, dismissedHints])

  const overlapTarget = useMemo(() => {
    if (!activeSketch) return null
    const existing = [...templateComponents, ...draggedComponents, ...chosenDrawnComponents]
    return existing.find(component => intersects(activeSketch, component)) ?? null
  }, [activeSketch, templateComponents, draggedComponents, chosenDrawnComponents])

  const activeSuggestions = useMemo(() => {
    if (!activeSketch) return []
    return getSketchSuggestions(activeSketch, { overlapsComponent: Boolean(overlapTarget) })
  }, [activeSketch, overlapTarget])

  // ── 1. Merge all component sources ───────────────────────────────────────────
  const interpreted = useMemo(() => {
    const all = [...templateComponents, ...draggedComponents, ...chosenDrawnComponents]
    return all.map((c, i) => {
      const over = typeOverrides[c.id]
      if (!over || over === c.type) return c
      return { ...c, type: over, props: defaultsForType(over, i) }
    })
  }, [templateComponents, draggedComponents, chosenDrawnComponents, typeOverrides])

  // ── 2. AI copilot refinement ──────────────────────────────────────────────────
  const { components, profile, changeSummary } = useMemo(
    () => refineComponentsWithPrompt(interpreted, appliedPrompt),
    [interpreted, appliedPrompt],
  )

  // ── 3. Code generation ────────────────────────────────────────────────────────
  const { jsx, css, themeJs, combined } = useMemo(
    () => generateReactCode(components, profile),
    [components, profile],
  )

  // ── 4. Canvas overlays ────────────────────────────────────────────────────────
  const componentOverlays = useMemo(
    () => interpreted.map(c => ({
      id: c.id, x: c.x, y: c.y, width: c.width, height: c.height,
      type: c.type, color: TYPE_ACCENT[c.type] ?? '#6366f1',
    })),
    [interpreted],
  )

  // ── Canvas handlers ───────────────────────────────────────────────────────────
  const handleTemplateSelect = (templateId, explicitComps) => {
    const comps = explicitComps ?? cloneTemplate(templateId)
    setTemplateComponents(comps)
    setDraggedComponents([])
    setSketchObjects([])
    setDrawnChoices({})
    setDismissedHints([])
    setCanvasKey(k => k + 1)
  }

  const handleDropComponent = (type, x, y) => {
    const idx = draggedComponents.length
    const { w, h } = COMP_DEFAULT_SIZES[type] ?? { w: 140, h: 44 }
    setDraggedComponents(prev => [...prev, {
      id:          `drop-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      type,
      x:           Math.max(0, x - Math.round(w / 2)),
      y:           Math.max(0, y - Math.round(h / 2)),
      width:       w,
      height:      h,
      style:       { ...COMP_DEFAULT_STYLES[type] },
      props:       defaultsForType(type, idx),
      sourceShape: 'dragged',
      source:      'dragged',
    }])
  }

  const handleClearAll = () => {
    setSketchObjects([])
    setTemplateComponents([])
    setDraggedComponents([])
    setDrawnChoices({})
    setDismissedHints([])
    setTypeOverrides({})
    setCanvasKey(k => k + 1)
  }

  const applySuggestion = (suggestion) => {
    if (!activeSketch) return

    if (suggestion.kind === 'keep') {
      setDrawnChoices(prev => ({ ...prev, [activeSketch.id]: { kind: 'keep' } }))
      return
    }

    const chosenType = suggestion.kind === 'attach' ? 'Badge' : suggestion.type
    setDrawnChoices(prev => ({
      ...prev,
      [activeSketch.id]: {
        kind: 'component',
        type: chosenType,
        attachTo: suggestion.kind === 'attach' ? overlapTarget?.id ?? null : null,
      },
    }))
    setDismissedHints(prev => prev.filter(id => id !== activeSketch.id))
  }

  const dismissSuggestion = () => {
    if (!activeSketch) return
    setDismissedHints(prev => (prev.includes(activeSketch.id) ? prev : [...prev, activeSketch.id]))
  }

  const handleOverride = (id, newType) =>
    setTypeOverrides(p => ({ ...p, [id]: newType }))

  // ── Copilot handlers ──────────────────────────────────────────────────────────
  // promptArg: preset string → apply directly; null → apply draftPrompt
  const handleApplyPrompt = (promptArg) => {
    const p = (promptArg !== null && promptArg !== undefined) ? promptArg : draftPrompt.trim()
    if (p === appliedPrompt) return
    setCopilotHistory(h => [...h, appliedPrompt])
    if (promptArg !== null && promptArg !== undefined) setDraftPrompt(promptArg)
    setAppliedPrompt(p)
  }

  const handleStyleSelect = (prompt) => {
    if (prompt === appliedPrompt) return
    setCopilotHistory(h => [...h, appliedPrompt])
    setDraftPrompt(prompt)
    setAppliedPrompt(prompt)
    setRightTab('preview') // show result immediately
  }

  const handleUndo = () => {
    if (!copilotHistory.length) return
    const prev = copilotHistory[copilotHistory.length - 1]
    setCopilotHistory(h => h.slice(0, -1))
    setAppliedPrompt(prev)
    setDraftPrompt(prev)
  }

  const handleReset = () => {
    setCopilotHistory([])
    setDraftPrompt('')
    setAppliedPrompt('')
  }

  // ── Code handlers ─────────────────────────────────────────────────────────────
  const flash = (key) => { setCopyState(key); setTimeout(() => setCopyState(''), 1800) }

  const handleCopy = async () => {
    const toCopy = codeSubTab === 'jsx' ? jsx : codeSubTab === 'css' ? css : codeSubTab === 'theme' ? themeJs : combined
    await navigator.clipboard.writeText(toCopy).catch(() => {})
    flash('Copied!')
  }
  const handleCopyJsx = async () => { await navigator.clipboard.writeText(jsx).catch(()=>{}); flash('jsx')  }
  const handleCopyCss = async () => { await navigator.clipboard.writeText(css).catch(()=>{}); flash('css')  }
  const handleDownload = () => {
    downloadText('GeneratedUI.jsx', jsx)
    setTimeout(() => downloadText('generatedStyles.css', css), 250)
    setTimeout(() => downloadText('theme.js', themeJs), 500)
  }

  const handleClearMemory = () => { clearMemory(); setMemoryVersion(v => v + 1) }

  const dominantProfile = getDominantProfile(memory)
  const sessionCount    = memory?.sessionCount ?? 0

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <div className="app-shell">

      {/* ── Topbar ─────────────────────────────────────────────────────── */}
      <header className="topbar">
        <div className="topbar-brand">
          <span className="brand-icon">✦</span>
          <span className="brand-name">Lume</span>
          <span className="brand-tag">Sketch → React</span>
        </div>

        <div className="topbar-meta">
          {components.length > 0 && (
            <span className="meta-chip">
              {components.length} component{components.length !== 1 ? 's' : ''}
            </span>
          )}
          {appliedPrompt && (
            <span className="meta-chip mood-chip">✨ {profile.mood}</span>
          )}
          {dominantProfile && sessionCount >= 2 && (
            <span className="meta-chip memory-chip" title="Your preferred style">
              🧠 {dominantProfile}
            </span>
          )}
          {(templateComponents.length > 0 || draggedComponents.length > 0 || sketchObjects.length > 0) && (
            <button className="meta-chip clear-chip" onClick={handleClearAll} title="Clear canvas">
              ✕ Clear
            </button>
          )}
        </div>
      </header>

      {/* ── Three-panel workspace ───────────────────────────────────────── */}
      <main className="main-area">

        {/* LEFT — Visual Options */}
        <LeftPanel
          onTemplateSelect={handleTemplateSelect}
          onStyleSelect={handleStyleSelect}
          appliedPrompt={appliedPrompt}
        />

        {/* CENTER — Drawing Canvas */}
        <section className="canvas-area">
          <CanvasDropZone onDropComponent={handleDropComponent}>
            <DrawingCanvas
              key={canvasKey}
              onObjectsChange={setSketchObjects}
              componentOverlays={componentOverlays}
            />
          </CanvasDropZone>

          {activeSketch && activeSuggestions.length > 0 && (
            <aside className="suggestion-panel" aria-live="polite">
              <div className="suggestion-head">
                <div>
                  <p className="suggestion-title">Interpretation Suggestions</p>
                  <p className="suggestion-sub">Choose one or keep drawing</p>
                </div>
                <button className="suggestion-close" onClick={dismissSuggestion} title="Ignore suggestions">×</button>
              </div>

              <div className="suggestion-grid">
                {activeSuggestions.map(suggestion => (
                  <button
                    key={suggestion.id}
                    className={`suggestion-card ${suggestion.kind === 'keep' ? 'keep' : ''}`}
                    onClick={() => applySuggestion(suggestion)}
                  >
                    <div className="suggestion-preview">
                      <SuggestionVisual type={suggestion.kind === 'keep' ? 'keep' : suggestion.type} />
                    </div>
                    <span className="suggestion-label">{suggestion.label}</span>
                  </button>
                ))}
              </div>
            </aside>
          )}
        </section>

        {/* RIGHT — Preview / Code / AI / Inspector */}
        <RightPanel
          components={components}
          profile={profile}
          interpreted={interpreted}
          typeOverrides={typeOverrides}
          onOverride={handleOverride}
          jsx={jsx}
          css={css}
          themeJs={themeJs}
          combined={combined}
          codeSubTab={codeSubTab}
          onCodeSubTab={setCodeSubTab}
          copyState={copyState}
          onCopy={handleCopy}
          onCopyJsx={handleCopyJsx}
          onCopyCss={handleCopyCss}
          onDownload={handleDownload}
          draftPrompt={draftPrompt}
          onDraftChange={setDraftPrompt}
          onApplyPrompt={handleApplyPrompt}
          appliedPrompt={appliedPrompt}
          copilotHistory={copilotHistory}
          onUndoCopilot={handleUndo}
          onResetPrompt={handleReset}
          changeSummary={changeSummary}
          dominantProfile={dominantProfile}
          sessionCount={sessionCount}
          onClearMemory={handleClearMemory}
          activeTab={rightTab}
          onTabChange={setRightTab}
        />
      </main>
    </div>
  )
}
