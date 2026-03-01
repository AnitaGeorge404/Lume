/**
 * componentModel.js
 * ─────────────────
 * Canonical Lume component schema.
 * All components flowing through the system conform to this shape.
 *
 * Schema:
 * {
 *   id:          string   — stable unique id (e.g. "obj-3")
 *   type:        string   — one of COMPONENT_TYPES
 *   x:           number   — left position on 760×480 canvas
 *   y:           number   — top position on 760×480 canvas
 *   width:       number
 *   height:      number
 *   style: {
 *     fill:      string   — background color
 *     text:      string   — foreground/text color
 *     border:    string   — border color
 *     radius:    number   — border-radius px
 *     shadow:    boolean
 *   }
 *   props:       object   — type-specific content (label, value, placeholder…)
 *   sourceShape: string   — original Fabric shape type ("rect", "path", …)
 * }
 */

export const COMPONENT_TYPES = ['Button', 'Card', 'Slider', 'Input', 'Badge', 'Divider']

/**
 * Accent colors used across the UI for visual distinction between component types.
 * Referenced by ComponentList, DrawingCanvas overlays, and future tooling.
 */
export const TYPE_ACCENT = {
  Button:  '#6366f1',
  Card:    '#0ea5e9',
  Slider:  '#10b981',
  Input:   '#f59e0b',
  Badge:   '#8b5cf6',
  Divider: '#94a3b8',
}

/** Emoji icons for each component type */
export const TYPE_EMOJI = {
  Button:  '🔲',
  Card:    '🃏',
  Slider:  '🎚️',
  Input:   '✏️',
  Badge:   '🏷️',
  Divider: '➖',
}

/**
 * Factory — creates a normalized component object.
 * @param {{ id, type, geometry, style, props, meta }} params
 * @returns Normalized component
 */
export function createComponent({ id, type, geometry, style, props, meta = {} }) {
  return {
    id,
    type,
    x: geometry.x,
    y: geometry.y,
    width:  geometry.width,
    height: geometry.height,
    style: {
      fill:   style.fill   ?? '#6366f1',
      text:   style.text   ?? '#ffffff',
      border: style.border ?? '#4f46e5',
      radius: style.radius ?? 12,
      shadow: style.shadow ?? false,
    },
    props,
    sourceShape: meta.sourceShape ?? 'unknown',
  }
}
