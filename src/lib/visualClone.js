import { analyzeScreenshotMeta, reconstructFromScreenshotAnalysis } from './screenshotEnhancer'

const CANVAS_W = 760
const CANVAS_H = 480

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value))
}

function fitContain(sourceW, sourceH, targetW, targetH) {
  const sourceRatio = sourceW / Math.max(1, sourceH)
  const targetRatio = targetW / Math.max(1, targetH)

  if (sourceRatio > targetRatio) {
    const width = targetW
    const height = Math.round(width / Math.max(0.001, sourceRatio))
    const x = 0
    const y = Math.round((targetH - height) / 2)
    return { x, y, width, height }
  }

  const height = targetH
  const width = Math.round(height * sourceRatio)
  const x = Math.round((targetW - width) / 2)
  const y = 0
  return { x, y, width, height }
}

export function extractVisualTokens(meta) {
  const base = meta?.dominant ?? '#2563eb'
  const tone = (meta?.avgLuma ?? 0.72) < 0.42 ? 'dark' : 'light'
  const radius = tone === 'dark' ? 0 : 10
  const shadow = tone === 'dark' ? '0 0 0 rgba(0,0,0,0)' : '0 8px 30px rgba(15, 23, 42, 0.12)'

  return {
    tone,
    palette: [base],
    fontScale: [12, 14, 16, 20, 24],
    fontWeights: [400, 500, 600, 700],
    radii: [radius, radius + 4],
    shadows: [shadow],
    spacing: [4, 8, 12, 16, 24],
  }
}

export function buildVisualCloneComponent(meta) {
  const frame = fitContain(meta.width, meta.height, CANVAS_W, CANVAS_H)

  return {
    id: 'visual-clone-root',
    type: 'VisualClone',
    x: frame.x,
    y: frame.y,
    width: clamp(frame.width, 80, CANVAS_W),
    height: clamp(frame.height, 80, CANVAS_H),
    style: {
      fill: 'transparent',
      text: '#0f172a',
      border: 'transparent',
      radius: 0,
      shadow: false,
    },
    props: {
      imageUrl: meta.dataUrl,
      intrinsicWidth: meta.width,
      intrinsicHeight: meta.height,
      fit: 'contain',
      tokens: extractVisualTokens(meta),
    },
    sourceShape: 'screenshot_visual_clone',
    source: 'template',
  }
}

function roleSuggestionsFor(type) {
  if (type === 'Button') return ['Button', 'Clickable region', 'Decorative']
  if (type === 'Input') return ['Input', 'Static container', 'Clickable region']
  if (type === 'Card') return ['Card', 'Static container', 'Clickable region']
  if (type === 'Badge') return ['Decorative', 'Static container', 'Clickable region']
  if (type === 'Slider') return ['Input', 'Clickable region', 'Decorative']
  if (type === 'Divider') return ['Decorative', 'Static container']
  return ['Static container', 'Decorative']
}

export function buildSemanticCandidates(meta) {
  const analysis = analyzeScreenshotMeta(meta)
  const scaffold = reconstructFromScreenshotAnalysis(analysis)

  return scaffold.map((item, index) => ({
    id: `sem-${index + 1}`,
    x: item.x,
    y: item.y,
    width: item.width,
    height: item.height,
    inferredType: item.type,
    inferredLabel: item.props?.title || item.props?.label || item.props?.placeholder || `Element ${index + 1}`,
    roleOptions: roleSuggestionsFor(item.type),
    chosenRole: 'Static container',
  }))
}

const ROLE_TO_TAG = {
  Button: 'button',
  Input: 'input',
  Card: 'section',
  'Static container': 'div',
  Decorative: 'div',
  'Clickable region': 'button',
}

export function buildSemanticLayerComponents(candidates) {
  return candidates
    .filter(candidate => candidate.chosenRole && candidate.chosenRole !== 'Static container')
    .map((candidate, idx) => ({
      id: `semantic-node-${idx + 1}`,
      type: 'SemanticNode',
      x: candidate.x,
      y: candidate.y,
      width: candidate.width,
      height: candidate.height,
      style: {
        fill: 'transparent',
        text: 'transparent',
        border: 'transparent',
        radius: 0,
        shadow: false,
      },
      props: {
        role: candidate.chosenRole,
        htmlTag: ROLE_TO_TAG[candidate.chosenRole] ?? 'div',
        label: candidate.inferredLabel,
      },
      sourceShape: 'semantic_lift_node',
      source: 'template',
    }))
}
