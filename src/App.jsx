import { useMemo, useState } from 'react'
import './App.css'
import { DrawingCanvas }   from './components/DrawingCanvas'
import { LeftPanel }       from './components/LeftPanel'
import { RightPanel }      from './components/RightPanel'
import { PreviewPanel }    from './components/PreviewPanel'
import { CanvasDropZone }  from './components/CanvasDropZone'
import { createComponentFromSketch, getSketchSuggestions, defaultsForType } from './lib/shapeInterpreter'
import { refineComponentsWithPrompt }              from './lib/copilot'
import { generateReactCode }                              from './lib/codeGenerator'
import { loadMemory, getDominantProfile, clearMemory } from './lib/intentEngine'
import { cloneTemplate }                           from './lib/templates'
import {
  analyzeScreenshotMeta,
  reconstructFromScreenshotAnalysis,
  enhanceReconstructedComponents,
  renderComparisonPreviewSvg,
} from './lib/screenshotEnhancer'
import {
  buildSemanticCandidates,
  buildSemanticLayerComponents,
  buildVisualCloneComponent,
} from './lib/visualClone'
import { extractUIBlocks, detectFramework }      from './lib/codeParser'
import {
  enhanceFromCodeBlocks,
  renderCodePreviewSvg,
  renderBeforePreviewSvg,
} from './lib/codeEnhancer'

// ─── Code pipeline display labels ───────────────────────────────────────────
const FRAMEWORK_DISPLAY = {
  react:          'React',
  vue:            'Vue',
  'react-native': 'React Native',
  flutter:        'Flutter',
  html:           'HTML / CSS',
  unknown:        'Code',
}

const LAYOUT_DISPLAY = {
  dashboard: 'Analytics Dashboard',
  landing:   'Landing Page',
  app:       'App Interface',
  form:      'Form',
  content:   'Content Page',
}

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

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value))
}

function hexToRgb(hex) {
  const normalized = hex.replace('#', '')
  const value = normalized.length === 3
    ? normalized.split('').map(v => v + v).join('')
    : normalized

  const num = Number.parseInt(value, 16)
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  }
}

function rgbToHex(r, g, b) {
  const to = (v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')
  return `#${to(r)}${to(g)}${to(b)}`
}

function darkenHex(hex, factor = 0.82) {
  const { r, g, b } = hexToRgb(hex)
  return rgbToHex(r * factor, g * factor, b * factor)
}

function estimateImageMetaFromDataUrl(dataUrl, file) {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = Math.max(1, Math.floor(image.width / 8))
      canvas.height = Math.max(1, Math.floor(image.height / 8))
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        resolve({ width: image.width, height: image.height, fileSize: file.size, avgLuma: 0.75, dominant: '#2563eb', dominantDark: '#1d4ed8' })
        return
      }

      ctx.drawImage(image, 0, 0, canvas.width, canvas.height)
      const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data

      let lumaSum = 0
      let rSum = 0
      let gSum = 0
      let bSum = 0
      let count = 0

      for (let i = 0; i < data.length; i += 16) {
        const r = data[i]
        const g = data[i + 1]
        const b = data[i + 2]
        const a = data[i + 3]
        if (a < 10) continue
        lumaSum += (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255
        rSum += r
        gSum += g
        bSum += b
        count += 1
      }

      const avgR = count ? rSum / count : 37
      const avgG = count ? gSum / count : 99
      const avgB = count ? bSum / count : 235
      const dominant = rgbToHex(avgR, avgG, avgB)

      resolve({
        width: image.width,
        height: image.height,
        fileSize: file.size,
        avgLuma: count ? (lumaSum / count) : 0.75,
        dominant,
        dominantDark: darkenHex(dominant),
      })
    }

    image.onerror = () => reject(new Error('Failed to load image'))
    image.src = dataUrl
  })
}

function SuggestionVisual({ suggestion }) {
  if (suggestion.kind === 'keep') {
    return (
      <svg viewBox="0 0 88 54" className="sg-card-svg">
        <rect x="6" y="8" width="76" height="38" rx="10" fill="#ffffff" stroke="#dbe4f0" strokeWidth="1.5" />
        <path d="M20 30c6-12 12 12 19 0 8-12 14 12 24-1" stroke="#334155" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      </svg>
    )
  }

  const type = suggestion.componentType
  const symbol = suggestion.symbol ?? '✦'

  if (type === 'Button') {
    return (
      <svg viewBox="0 0 88 54" className="sg-card-svg">
        <rect x="10" y="14" width="68" height="26" rx="9" fill="#2563eb" />
        <text x="44" y="31" textAnchor="middle" fontSize="14" fill="#ffffff" fontWeight="700">{symbol}</text>
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
        <text x="20" y="30" textAnchor="start" fontSize="11" fill="#94a3b8" opacity="0.8">{symbol}</text>
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
        <text x="44" y="31" textAnchor="middle" fontSize="12" fill="#1d4ed8" fontWeight="700">{symbol}</text>
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
  Nav:     { w: 728, h: 56 },
  Hero:    { w: 728, h: 140 },
  Section: { w: 280, h: 110 },
}

const COMP_DEFAULT_STYLES = {
  Button:  { fill: '#2563eb', text: '#ffffff', border: '#1d4ed8', radius: 12,  shadow: true  },
  Card:    { fill: '#ffffff', text: '#0f172a', border: '#e2e8f0', radius: 16,  shadow: true  },
  Slider:  { fill: '#e0f2fe', text: '#075985', border: '#0284c7', radius: 10,  shadow: false },
  Input:   { fill: '#f8fafc', text: '#334155', border: '#cbd5e1', radius: 12,  shadow: false },
  Badge:   { fill: '#eff6ff', text: '#1e3a8a', border: '#93c5fd', radius: 999, shadow: false },
  Divider: { fill: 'transparent', text: '#94a3b8', border: '#e2e8f0', radius: 0, shadow: false },
  Nav:     { fill: '#1e293b', text: '#f8fafc', border: '#334155', radius: 0,   shadow: true  },
  Hero:    { fill: '#6d28d9', text: '#ffffff', border: '#7c3aed', radius: 0,   shadow: true  },
  Section: { fill: '#f0fdfa', text: '#134e4a', border: '#99f6e4', radius: 12,  shadow: false },
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
  const [screenshotState,    setScreenshotState]    = useState(null)
  const [codeState,          setCodeState]          = useState(null)
  const [appliedCodeFw,      setAppliedCodeFw]      = useState(null)
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
        const base = createComponentFromSketch(sketch, choice.componentType, index)

        const nextWidth = choice.widthScale
          ? clamp(Math.round(base.width * choice.widthScale), 50, 360)
          : base.width
        const nextHeight = choice.heightScale
          ? clamp(Math.round(base.height * choice.heightScale), 20, 240)
          : base.height

        return {
          ...base,
          width: nextWidth,
          height: nextHeight,
          style: { ...base.style, ...(choice.stylePatch ?? {}) },
          props: { ...base.props, ...(choice.propsPatch ?? {}) },
        }
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

  const enhancedSvg = useMemo(() => {
    if (!screenshotState?.scaffoldPreview?.length) return ''
    return renderComparisonPreviewSvg(screenshotState.scaffoldPreview)
  }, [screenshotState])

  const scaffoldPreviewDataUrl = useMemo(() => {
    if (!enhancedSvg) return ''
    return `data:image/svg+xml;utf8,${encodeURIComponent(enhancedSvg)}`
  }, [enhancedSvg])

  // ── Code enhancement pipeline previews ──────────────────────────────────────
  const codeBeforeSvg = useMemo(() => {
    if (!codeState?.blocks?.length) return ''
    return renderBeforePreviewSvg(codeState.blocks)
  }, [codeState])

  const codeAfterSvg = useMemo(() => {
    if (!codeState?.proposedComponents?.length) return ''
    return renderCodePreviewSvg(codeState.proposedComponents)
  }, [codeState])

  const codeBeforeDataUrl = useMemo(
    () => codeBeforeSvg ? `data:image/svg+xml;utf8,${encodeURIComponent(codeBeforeSvg)}` : '',
    [codeBeforeSvg],
  )

  const codeAfterDataUrl = useMemo(
    () => codeAfterSvg ? `data:image/svg+xml;utf8,${encodeURIComponent(codeAfterSvg)}` : '',
    [codeAfterSvg],
  )

  const groupedSuggestions = useMemo(() => {
    const order = ['shape', 'ui', 'decor', 'meaning', 'drawing']
    const grouped = order
      .map(category => ({
        category,
        items: activeSuggestions.filter(item => item.category === category),
      }))
      .filter(group => group.items.length > 0)

    return grouped
  }, [activeSuggestions])

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
    () => generateReactCode(components, profile, { sourceFramework: appliedCodeFw }),
    [components, profile, appliedCodeFw],
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
    setScreenshotState(null)
    setCodeState(null)
    setAppliedCodeFw(null)
    setTypeOverrides({})
    setCanvasKey(k => k + 1)
  }

  const handleScreenshotUpload = async (file) => {
    if (!file) return
    setCodeState(null) // mutual exclusion — one workbench at a time
    const reader = new FileReader()
    reader.onload = async () => {
      const dataUrl = String(reader.result ?? '')
      if (!dataUrl) return
      try {
        const meta = await estimateImageMetaFromDataUrl(dataUrl, file)
        const fullMeta = {
          ...meta,
          dataUrl,
          fileName: file.name,
          fileSize: file.size,
        }
        const cloneComponent = buildVisualCloneComponent(fullMeta)
        const semanticCandidates = buildSemanticCandidates(fullMeta)
        setScreenshotState({
          fileName: file.name,
          dataUrl,
          width: meta.width,
          height: meta.height,
          fileSize: file.size,
          avgLuma: meta.avgLuma,
          dominant: meta.dominant,
          dominantDark: meta.dominantDark,
          keepReference: false,
          showReference: false,
          sideBySide: false,
          phase: 'clone',
          analysis: null,
          semanticCandidates,
          selectedSemanticId: semanticCandidates[0]?.id ?? null,
          cloneZoom: 1,
          clonePanX: 0,
          clonePanY: 0,
          cloneComponent,
          proposedComponents: [cloneComponent],
          status: 'cloned',
        })
      } catch {
        setScreenshotState(null)
      }
    }
    reader.readAsDataURL(file)
  }

  const handleScreenshotAnalyze = () => {
    if (!screenshotState) return
    setScreenshotState(prev => {
      if (!prev) return prev
      if (prev.phase === 'lift') {
        return { ...prev, phase: 'clone' }
      }
      const analysis = analyzeScreenshotMeta(prev)
      const reconstructed = reconstructFromScreenshotAnalysis(analysis)
      const polished = enhanceReconstructedComponents(reconstructed)
      const candidates = prev.semanticCandidates?.length
        ? prev.semanticCandidates
        : buildSemanticCandidates(prev)
      return {
        ...prev,
        phase: 'lift',
        analysis,
        semanticCandidates: candidates,
        selectedSemanticId: candidates[0]?.id ?? null,
        status: 'lift-ready',
        // keep phase 1 visual clone as default render source
        proposedComponents: [prev.cloneComponent],
        scaffoldPreview: polished,
      }
    })
  }

  const handleScreenshotApply = () => {
    if (!screenshotState?.cloneComponent) return
    const semanticLayer = buildSemanticLayerComponents(screenshotState.semanticCandidates ?? [])
    const accepted = [screenshotState.cloneComponent, ...semanticLayer]
    if (!accepted.length) return

    setTemplateComponents(accepted)
    setDraggedComponents([])
    setSketchObjects([])
    setDrawnChoices({})
    setDismissedHints([])
    setCanvasKey(k => k + 1)

    setScreenshotState(prev => {
      if (!prev) return prev
      if (prev.keepReference) {
        return { ...prev, status: 'applied' }
      }
      return null
    })
  }

  const handleSemanticSelect = (candidateId) => {
    setScreenshotState(prev => prev
      ? { ...prev, selectedSemanticId: candidateId }
      : prev)
  }

  const handleSemanticRoleChange = (candidateId, nextRole) => {
    setScreenshotState(prev => {
      if (!prev) return prev
      return {
        ...prev,
        semanticCandidates: (prev.semanticCandidates ?? []).map(candidate =>
          candidate.id === candidateId
            ? { ...candidate, chosenRole: nextRole }
            : candidate,
        ),
      }
    })
  }

  const handleScreenshotDiscard = () => setScreenshotState(null)

  const handleCloneZoom = (nextZoom) => {
    setScreenshotState(prev => prev
      ? { ...prev, cloneZoom: clamp(nextZoom, 0.5, 3) }
      : prev)
  }

  const handleClonePan = (dx, dy) => {
    setScreenshotState(prev => {
      if (!prev) return prev
      return {
        ...prev,
        clonePanX: clamp((prev.clonePanX ?? 0) + dx, -320, 320),
        clonePanY: clamp((prev.clonePanY ?? 0) + dy, -240, 240),
      }
    })
  }

  const resetCloneViewport = () => {
    setScreenshotState(prev => prev
      ? { ...prev, cloneZoom: 1, clonePanX: 0, clonePanY: 0 }
      : prev)
  }

  // ── Code pipeline handlers ────────────────────────────────────────────────
  const handleCodeChange = (rawCode) => {
    if (!rawCode?.trim()) {
      setCodeState(null)
      return
    }
    setScreenshotState(null) // mutual exclusion
    const framework = detectFramework(rawCode)
    setCodeState(prev => ({
      ...(prev ?? { fileName: null }),
      rawCode,
      framework,
      blocks: [],
      proposedComponents: [],
      status: 'idle',
      layout: null,
      issues: [],
      elementCount: 0,
    }))
  }

  const handleCodeUpload = (file) => {
    const reader = new FileReader()
    reader.onload = () => {
      const rawCode = String(reader.result ?? '')
      if (!rawCode?.trim()) return
      setScreenshotState(null) // mutual exclusion
      const framework = detectFramework(rawCode)
      setCodeState({
        rawCode,
        fileName: file.name,
        framework,
        blocks: [],
        proposedComponents: [],
        status: 'idle',
        layout: null,
        issues: [],
        elementCount: 0,
      })
    }
    reader.readAsText(file)
  }

  const handleCodeParse = () => {
    if (!codeState?.rawCode?.trim()) return
    const { framework, blocks, elementCount } = extractUIBlocks(codeState.rawCode)
    const { components, layout, issues } = enhanceFromCodeBlocks(blocks, framework)
    setCodeState(prev => ({
      ...prev,
      framework,
      blocks,
      proposedComponents: components,
      status: 'enhanced',
      layout,
      issues,
      elementCount,
    }))
  }

  const handleCodeApply = () => {
    if (!codeState?.proposedComponents?.length) return
    setTemplateComponents(codeState.proposedComponents)
    setDraggedComponents([])
    setSketchObjects([])
    setDrawnChoices({})
    setDismissedHints([])
    setCanvasKey(k => k + 1)
    setAppliedCodeFw(codeState.framework ?? null)
    setCodeState(null)
  }

  const handleCodeDiscard = () => setCodeState(null)

  const applySuggestion = (suggestion) => {
    if (!activeSketch) return

    if (suggestion.kind === 'keep') {
      setDrawnChoices(prev => ({ ...prev, [activeSketch.id]: { kind: 'keep' } }))
      return
    }

    const chosenType = suggestion.kind === 'attach' ? 'Badge' : suggestion.componentType
    setDrawnChoices(prev => ({
      ...prev,
      [activeSketch.id]: {
        kind: 'component',
        componentType: chosenType,
        widthScale: suggestion.widthScale,
        heightScale: suggestion.heightScale,
        stylePatch: suggestion.stylePatch,
        propsPatch: suggestion.propsPatch,
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
  const frameworkTag    = FRAMEWORK_DISPLAY[codeState?.framework ?? appliedCodeFw ?? 'react'] ?? 'React'
  const styleTags       = [
    appliedPrompt ? profile.mood : null,
    dominantProfile,
  ].filter(Boolean)

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <div className="app-shell">

      {/* ── Topbar ─────────────────────────────────────────────────────── */}
      <header className="topbar">
        <div className="topbar-brand">
          <span className="brand-icon">✦</span>
          <span className="brand-name">Lume</span>
          <span className="brand-tag">UI Enhancement Platform</span>
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
          {codeState && (
            <span className="meta-chip code-fw-chip analyzing" title="Code analysis in progress">
              ⟨/⟩ {FRAMEWORK_DISPLAY[codeState.framework] ?? 'Code'}
            </span>
          )}
          {appliedCodeFw && !codeState && (
            <span className="meta-chip code-fw-chip" title="Components enhanced from code">
              ⟨/⟩ {appliedCodeFw}
            </span>
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

          <div className="topbar-tabs" role="tablist" aria-label="Workspace tabs">
            {[
              ['preview', 'Preview'],
              ['code', 'Code'],
              ['ai', 'AI'],
              ['inspector', 'Inspector'],
            ].map(([id, label]) => (
              <button
                key={id}
                className={`topbar-tab ${rightTab === id ? 'active' : ''}`}
                onClick={() => setRightTab(id)}
                role="tab"
                aria-selected={rightTab === id}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* ── Three-panel workspace ───────────────────────────────────────── */}
      <main className="main-area">

        {/* LEFT — Visual Options */}
        <LeftPanel
          onTemplateSelect={handleTemplateSelect}
          onStyleSelect={handleStyleSelect}
          appliedPrompt={appliedPrompt}
          onScreenshotUpload={handleScreenshotUpload}
          onScreenshotAnalyze={handleScreenshotAnalyze}
          onScreenshotApply={handleScreenshotApply}
          onScreenshotDiscard={handleScreenshotDiscard}
          screenshotState={screenshotState}
          onCodeUpload={handleCodeUpload}
          onCodeChange={handleCodeChange}
          onCodeParse={handleCodeParse}
          onCodeApply={handleCodeApply}
          onCodeDiscard={handleCodeDiscard}
          codeState={codeState}
        />

        {/* CENTER — Canvas (top) + Live Preview (bottom) */}
        <section className="workspace-center">
          <div className="canvas-area">
            {screenshotState?.dataUrl && (
              <aside className="screenshot-workbench">
                <div className="ss-head">
                  <p className="ss-title">Visual Clone Pipeline</p>
                  <span className="ss-step">
                    {screenshotState.phase === 'lift' ? 'Phase 2 · Semantic Lift (Optional)' : 'Phase 1 · Visual Clone (Default)'}
                  </span>
                </div>

                <div className={`ss-preview-stack ${screenshotState.sideBySide ? 'compare' : ''}`}>
                  <div className="ss-pane polished">
                    <div className="ss-pane-headline">Cloned UI (Default)</div>
                    <div className="ss-preview-frame polished">
                      <div
                        className="ss-clone-stage"
                        style={{
                          transform: `translate(${screenshotState.clonePanX ?? 0}px, ${screenshotState.clonePanY ?? 0}px) scale(${screenshotState.cloneZoom ?? 1})`,
                          transformOrigin: 'center center',
                        }}
                      >
                        <img
                          src={screenshotState.dataUrl}
                          alt="Pixel-accurate cloned UI"
                        />
                        {screenshotState.phase === 'lift' && (screenshotState.semanticCandidates ?? []).slice(0, 20).map(candidate => (
                          <button
                            key={candidate.id}
                            className={`ss-hitbox ${screenshotState.selectedSemanticId === candidate.id ? 'active' : ''}`}
                            style={{
                              left: `${(candidate.x / 760) * 100}%`,
                              top: `${(candidate.y / 480) * 100}%`,
                              width: `${(candidate.width / 760) * 100}%`,
                              height: `${(candidate.height / 480) * 100}%`,
                            }}
                            onClick={() => handleSemanticSelect(candidate.id)}
                            title={candidate.inferredLabel}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  {(screenshotState.showReference || screenshotState.sideBySide) && (
                    <div className="ss-pane reference">
                      <div className="ss-pane-headline">Original Screenshot</div>
                      <div className="ss-preview-frame reference">
                        <img src={screenshotState.dataUrl} alt="Uploaded UI reference" />
                      </div>
                    </div>
                  )}

                  {screenshotState.phase === 'lift' && scaffoldPreviewDataUrl && (
                    <div className="ss-pane semantic">
                      <div className="ss-pane-headline">Semantic Scaffolding (non-visual)</div>
                      <div className="ss-preview-frame semantic">
                        <img src={scaffoldPreviewDataUrl} alt="Semantic candidate scaffolding preview" />
                      </div>
                    </div>
                  )}
                </div>

                {screenshotState.phase === 'lift' && screenshotState.semanticCandidates?.length > 0 && (
                  <div className="ss-semantic-list">
                    {screenshotState.semanticCandidates.slice(0, 8).map(candidate => (
                      <div
                        key={candidate.id}
                        className={`ss-sem-row ${screenshotState.selectedSemanticId === candidate.id ? 'active' : ''}`}
                        onClick={() => handleSemanticSelect(candidate.id)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter' || event.key === ' ') {
                            event.preventDefault()
                            handleSemanticSelect(candidate.id)
                          }
                        }}
                      >
                        <div className="ss-sem-copy">
                          <strong>{candidate.inferredLabel}</strong>
                          <span>{candidate.inferredType}</span>
                        </div>
                        <select
                          className="ss-sem-select"
                          value={candidate.chosenRole}
                          onChange={(event) => handleSemanticRoleChange(candidate.id, event.target.value)}
                          onClick={(event) => event.stopPropagation()}
                        >
                          {candidate.roleOptions.map(option => (
                            <option key={option} value={option}>{option}</option>
                          ))}
                        </select>
                      </div>
                    ))}
                  </div>
                )}

                <div className="ss-foot">
                  <label className="ss-keep-ref">
                    <input
                      type="checkbox"
                      checked={Boolean(screenshotState.keepReference)}
                      onChange={event => setScreenshotState(prev => prev ? { ...prev, keepReference: event.target.checked } : prev)}
                    />
                    Keep screenshot reference after apply
                  </label>
                  <div className="ss-viewport-controls">
                    <button className="ss-action ghost" onClick={() => handleCloneZoom((screenshotState.cloneZoom ?? 1) - 0.1)}>−</button>
                    <input
                      type="range"
                      min="0.5"
                      max="3"
                      step="0.05"
                      value={screenshotState.cloneZoom ?? 1}
                      onChange={(event) => handleCloneZoom(Number(event.target.value))}
                    />
                    <button className="ss-action ghost" onClick={() => handleCloneZoom((screenshotState.cloneZoom ?? 1) + 0.1)}>+</button>
                    <button className="ss-action ghost" onClick={() => handleClonePan(-18, 0)}>←</button>
                    <button className="ss-action ghost" onClick={() => handleClonePan(18, 0)}>→</button>
                    <button className="ss-action ghost" onClick={() => handleClonePan(0, -14)}>↑</button>
                    <button className="ss-action ghost" onClick={() => handleClonePan(0, 14)}>↓</button>
                    <button className="ss-action ghost" onClick={resetCloneViewport}>Reset</button>
                  </div>
                  <div className="ss-foot-actions">
                    <button
                      className="ss-action ghost"
                      onClick={() => setScreenshotState(prev => prev ? { ...prev, showReference: !prev.showReference, sideBySide: false } : prev)}
                    >
                      {screenshotState.showReference ? 'Hide Original' : 'View Original'}
                    </button>
                    <button
                      className="ss-action ghost"
                      onClick={() => setScreenshotState(prev => prev ? { ...prev, sideBySide: !prev.sideBySide, showReference: prev.sideBySide ? prev.showReference : true } : prev)}
                    >
                      {screenshotState.sideBySide ? 'Single View' : 'Side-by-side Compare'}
                    </button>
                    <button className="ss-action ghost" onClick={handleScreenshotAnalyze}>
                      {screenshotState.phase === 'lift' ? 'Back to Visual Clone' : 'Enter Semantic Lift'}
                    </button>
                    <button className="ss-action" onClick={handleScreenshotApply} disabled={!screenshotState.proposedComponents.length}>
                      Apply Cloned UI
                    </button>
                  </div>
                </div>
              </aside>
            )}

            {/* Code Enhancement Workbench */}
            {codeState && (
              <aside className="code-workbench">
              <div className="cw-head">
                <div className="cw-head-text">
                  <p className="cw-title">Code Enhancement</p>
                  <span className="cw-step">
                    {codeState.status === 'enhanced'
                      ? `${FRAMEWORK_DISPLAY[codeState.framework] ?? 'Code'} · ${codeState.elementCount} element${codeState.elementCount !== 1 ? 's' : ''} → ${LAYOUT_DISPLAY[codeState.layout] ?? 'polished UI'}`
                      : codeState.rawCode?.trim()?.length > 0
                        ? `${FRAMEWORK_DISPLAY[codeState.framework] ?? 'Code'} · Click Analyze to rebuild`
                        : 'Paste code in the left panel to start'}
                  </span>
                </div>
                <button className="cw-close" onClick={handleCodeDiscard} title="Close">×</button>
              </div>

              <div className="cw-preview-row">
                <div className="cw-pane">
                  <div className="cw-pane-label">Before <span className="cw-badge">Original</span></div>
                  <div className="cw-preview-frame before">
                    {codeBeforeDataUrl ? (
                      <img src={codeBeforeDataUrl} alt="Original code structure wireframe" />
                    ) : (
                      <div className="cw-preview-empty">
                        <span className="cw-empty-icon">⟨/⟩</span>
                        <span>Structure wireframe appears after analyze</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="cw-pane">
                  <div className="cw-pane-label">After <span className="cw-badge enhanced">Enhanced</span></div>
                  <div className="cw-preview-frame after">
                    {codeAfterDataUrl ? (
                      <img src={codeAfterDataUrl} alt="Polished enhanced UI preview" />
                    ) : (
                      <div className="cw-preview-empty">
                        <span className="cw-empty-icon">✦</span>
                        <span>Polished UI preview appears after analyze</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {codeState.status === 'enhanced' && codeState.blocks?.length > 0 && (
                <div className="cw-blocks">
                  {Array.from(new Set(codeState.blocks.map(b => b.kind))).slice(0, 8).map(kind => (
                    <span key={kind} className="cw-block-chip">{kind}</span>
                  ))}
                  <span className="cw-block-count">{codeState.blocks.length} block{codeState.blocks.length !== 1 ? 's' : ''}</span>
                </div>
              )}

              {codeState.issues?.length > 0 && (
                <div className="cw-issues">
                  {codeState.issues.slice(0, 4).map((issue, i) => (
                    <div key={i} className="cw-issue">✦ {issue}</div>
                  ))}
                </div>
              )}

              <div className="cw-foot">
                <div className="cw-foot-actions">
                  <button className="cw-action ghost" onClick={handleCodeParse}>
                    {codeState.status === 'enhanced' ? 'Re-analyze' : 'Analyze & Enhance'}
                  </button>
                  <button
                    className="cw-action"
                    onClick={handleCodeApply}
                    disabled={!codeState.proposedComponents?.length}
                  >
                    Apply to Canvas
                  </button>
                </div>
              </div>
              </aside>
            )}

            <CanvasDropZone onDropComponent={handleDropComponent}>
              <DrawingCanvas
                key={canvasKey}
                onObjectsChange={setSketchObjects}
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

              {groupedSuggestions.map(group => (
                <section key={group.category} className="suggestion-group">
                  <p className="suggestion-group-title">
                    <span>{group.items[0].categoryIcon}</span>
                    {group.items[0].categoryLabel}
                  </p>
                  <div className="suggestion-grid">
                    {group.items.map(suggestion => (
                      <button
                        key={suggestion.id}
                        className={`suggestion-card ${suggestion.kind === 'keep' ? 'keep' : ''}`}
                        onClick={() => applySuggestion(suggestion)}
                      >
                        <div className="suggestion-preview">
                          <SuggestionVisual suggestion={suggestion} />
                        </div>
                        <span className="suggestion-label">{suggestion.label}</span>
                        <span className="suggestion-role">{suggestion.role}</span>
                      </button>
                    ))}
                  </div>
                </section>
              ))}
              </aside>
            )}
          </div>

          <section className="preview-stage" aria-label="Live preview">
            <div className="preview-stage-head">
              <div>
                <p className="preview-stage-kicker">LIVE PREVIEW</p>
                <h3 className="preview-stage-title">Production Look</h3>
              </div>
              <div className="preview-stage-meta">
                <span className="meta-chip">{components.length} component{components.length !== 1 ? 's' : ''}</span>
                <span className="meta-chip code-fw-chip">⟨/⟩ {frameworkTag}</span>
                {styleTags.slice(0, 2).map(tag => (
                  <span key={tag} className="meta-chip mood-chip">✦ {tag}</span>
                ))}
              </div>
            </div>

            <div className="preview-hero-shell">
              <PreviewPanel components={components} profile={profile} />
            </div>
          </section>
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
          frameworkTag={frameworkTag}
          styleTags={styleTags}
        />
      </main>
    </div>
  )
}
