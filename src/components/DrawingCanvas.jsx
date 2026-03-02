import { useEffect, useRef, useState } from 'react'
import { Canvas, Circle, Line, PencilBrush, Rect } from 'fabric'
import './DrawingCanvas.css'

const CANVAS_WIDTH = 760
const CANVAS_HEIGHT = 480

function normalizeFabricObject(object) {
  const bounding = object.getBoundingRect()
  const base = {
    id: object.data?.id || `${object.type}-${Math.random().toString(36).slice(2)}`,
    shape: object.type,
    x: bounding.left,
    y: bounding.top,
    width: bounding.width,
    height: bounding.height,
  }

  if (object.type === 'line') {
    return {
      ...base,
      x1: object.x1,
      x2: object.x2,
      y1: object.y1,
      y2: object.y2,
    }
  }

  return base
}

export function DrawingCanvas({ onObjectsChange }) {
  const canvasElRef = useRef(null)
  const fabricCanvasRef = useRef(null)
  const toolRef = useRef('draw')
  const startPointRef = useRef(null)
  const draftShapeRef = useRef(null)
  const sequenceRef = useRef(0)
  const [tool, setTool] = useState('draw')

  const tools = [
    ['draw', '✏︎', 'Freehand'],
    ['rect', '▭', 'Rectangle'],
    ['circle', '◯', 'Circle'],
    ['line', '／', 'Line'],
    ['select', '⌖', 'Select'],
  ]

  useEffect(() => {
    const canvas = new Canvas(canvasElRef.current, {
      width: CANVAS_WIDTH,
      height: CANVAS_HEIGHT,
      backgroundColor: '#ffffff',
      preserveObjectStacking: true,
    })

    canvas.freeDrawingBrush = new PencilBrush(canvas)
    canvas.freeDrawingBrush.width = 2
    canvas.freeDrawingBrush.color = '#111827'
    fabricCanvasRef.current = canvas

    const emitObjects = () => {
      const payload = canvas
        .getObjects()
        .filter((object) => !object.excludeFromExport)
        .map(normalizeFabricObject)
      onObjectsChange(payload)
    }

    const ensureObjectId = (event) => {
      if (!event.target) {
        return
      }
      if (!event.target.data) {
        event.target.data = {}
      }
      if (!event.target.data.id) {
        sequenceRef.current += 1
        event.target.data.id = `obj-${sequenceRef.current}`
      }
    }

    const onMouseDown = (event) => {
      const activeTool = toolRef.current
      if (!['rect', 'circle', 'line'].includes(activeTool)) {
        return
      }

      const point = canvas.getPointer(event.e)
      startPointRef.current = point

      if (activeTool === 'rect') {
        draftShapeRef.current = new Rect({
          left: point.x,
          top: point.y,
          width: 1,
          height: 1,
          fill: 'rgba(15, 23, 42, 0.08)',
          stroke: '#0f172a',
          strokeWidth: 2,
        })
      }

      if (activeTool === 'circle') {
        draftShapeRef.current = new Circle({
          left: point.x,
          top: point.y,
          radius: 1,
          fill: 'rgba(15, 23, 42, 0.08)',
          stroke: '#0f172a',
          strokeWidth: 2,
        })
      }

      if (activeTool === 'line') {
        draftShapeRef.current = new Line([point.x, point.y, point.x, point.y], {
          stroke: '#0f172a',
          strokeWidth: 3,
        })
      }

      if (draftShapeRef.current) {
        canvas.add(draftShapeRef.current)
      }
    }

    const onMouseMove = (event) => {
      const draftShape = draftShapeRef.current
      const startPoint = startPointRef.current
      if (!draftShape || !startPoint) {
        return
      }

      const point = canvas.getPointer(event.e)

      const activeTool = toolRef.current

      if (activeTool === 'rect') {
        draftShape.set({
          left: Math.min(startPoint.x, point.x),
          top: Math.min(startPoint.y, point.y),
          width: Math.abs(point.x - startPoint.x),
          height: Math.abs(point.y - startPoint.y),
        })
      }

      if (activeTool === 'circle') {
        const radius = Math.max(
          1,
          Math.hypot(point.x - startPoint.x, point.y - startPoint.y) / 2,
        )
        draftShape.set({
          radius,
          left: Math.min(startPoint.x, point.x),
          top: Math.min(startPoint.y, point.y),
        })
      }

      if (activeTool === 'line') {
        draftShape.set({
          x2: point.x,
          y2: point.y,
        })
      }

      canvas.requestRenderAll()
    }

    const onMouseUp = () => {
      draftShapeRef.current = null
      startPointRef.current = null
      emitObjects()
    }

    const emitOnMutation = (event) => {
      ensureObjectId(event)
      emitObjects()
    }

    canvas.on('mouse:down', onMouseDown)
    canvas.on('mouse:move', onMouseMove)
    canvas.on('mouse:up', onMouseUp)
    canvas.on('object:added', emitOnMutation)
    canvas.on('object:modified', emitOnMutation)
    canvas.on('object:removed', emitOnMutation)

    emitObjects()

    return () => {
      canvas.dispose()
    }
  }, [onObjectsChange])

  useEffect(() => {
    const canvas = fabricCanvasRef.current
    if (!canvas) {
      return
    }

    toolRef.current = tool
    canvas.isDrawingMode = tool === 'draw'
    canvas.selection = tool === 'select'
    canvas.forEachObject((object) => {
      object.selectable = tool === 'select'
      object.evented = tool === 'select'
    })
    canvas.requestRenderAll()
  }, [tool])

  const undo = () => {
    const canvas = fabricCanvasRef.current
    if (!canvas) {
      return
    }
    const objects = canvas.getObjects()
    if (objects.length > 0) {
      canvas.remove(objects[objects.length - 1])
    }
  }

  const clear = () => {
    const canvas = fabricCanvasRef.current
    if (!canvas) {
      return
    }
    canvas.getObjects().forEach((object) => canvas.remove(object))
    onObjectsChange([])
  }

  return (
    <div className="drawing-canvas-wrap">
      <div className="tool-row">
        {tools.map(([value, icon, label]) => (
          <button
            key={value}
            className={tool === value ? 'active' : ''}
            onClick={() => setTool(value)}
          >
            <span className="tool-icon" aria-hidden="true">{icon}</span>
            <span className="tool-label">{label}</span>
          </button>
        ))}

        <button className="ghost" onClick={undo}>
          <span className="tool-icon" aria-hidden="true">↶</span>
          <span className="tool-label">Undo</span>
        </button>
        <button className="ghost" onClick={clear}>
          <span className="tool-icon" aria-hidden="true">✕</span>
          <span className="tool-label">Clear</span>
        </button>
      </div>

      {/* Canvas wrapper */}
      <div className="canvas-container">
        <canvas ref={canvasElRef} width={CANVAS_WIDTH} height={CANVAS_HEIGHT} />
      </div>
    </div>
  )
}
