import { useRef, useState } from 'react'
import './CanvasDropZone.css'

const CANVAS_WIDTH  = 760
const CANVAS_HEIGHT = 480

/**
 * CanvasDropZone
 * Wraps the DrawingCanvas section and converts HTML5 drag-drop events
 * into canvas-space coordinates, then calls onDropComponent(type, x, y).
 *
 * Props:
 *   children         — the DrawingCanvas element
 *   onDropComponent  — (type: string, x: number, y: number) => void
 */
export function CanvasDropZone({ children, onDropComponent }) {
  const zoneRef  = useRef(null)
  const [active, setActive] = useState(false)

  const toCanvasCoords = (clientX, clientY) => {
    const rect = zoneRef.current?.getBoundingClientRect()
    if (!rect) return { x: 80, y: 80 }

    // The canvas element itself may be scaled. Find the inner canvas dimensions.
    const canvasEl = zoneRef.current.querySelector('canvas')
    const renderedW = canvasEl ? canvasEl.getBoundingClientRect().width  : rect.width
    const renderedH = canvasEl ? canvasEl.getBoundingClientRect().height : rect.height
    const canvasLeft = canvasEl
      ? canvasEl.getBoundingClientRect().left
      : rect.left
    const canvasTop  = canvasEl
      ? canvasEl.getBoundingClientRect().top
      : rect.top

    const relX = clientX - canvasLeft
    const relY = clientY - canvasTop
    const scaleX = CANVAS_WIDTH  / (renderedW  || CANVAS_WIDTH)
    const scaleY = CANVAS_HEIGHT / (renderedH || CANVAS_HEIGHT)

    return {
      x: Math.round(Math.max(10, Math.min(680, relX * scaleX))),
      y: Math.round(Math.max(10, Math.min(440, relY * scaleY))),
    }
  }

  const handleDragOver = (e) => {
    if (!e.dataTransfer.types.includes('lume/component-type')) return
    e.preventDefault()
    e.dataTransfer.dropEffect = 'copy'
    setActive(true)
  }

  const handleDragLeave = (e) => {
    if (!zoneRef.current?.contains(e.relatedTarget)) setActive(false)
  }

  const handleDrop = (e) => {
    setActive(false)
    const type = e.dataTransfer.getData('lume/component-type')
    if (!type) return
    e.preventDefault()
    const { x, y } = toCanvasCoords(e.clientX, e.clientY)
    onDropComponent(type, x, y)
  }

  return (
    <div
      ref={zoneRef}
      className={`canvas-drop-zone ${active ? 'drop-zone-active' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {children}
      {active && (
        <div className="drop-zone-overlay">
          <span className="drop-zone-hint">Drop to place component</span>
        </div>
      )}
    </div>
  )
}
