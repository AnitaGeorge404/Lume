import { COMPONENT_TYPES, TYPE_ACCENT, TYPE_EMOJI } from '../lib/componentModel'
import './ComponentList.css'

const TYPES = COMPONENT_TYPES
const TYPE_COLOR = TYPE_ACCENT

export function ComponentList({ components, overrides, onOverride }) {
  if (components.length === 0) {
    return (
      <div className="cl-wrap">
        <p className="cl-empty">No components yet — draw something!</p>
      </div>
    )
  }

  return (
    <div className="cl-wrap">
      <div className="cl-list">
        {components.map((c, i) => {
          const effectiveType = overrides[c.id] ?? c.type
          return (
            <div key={c.id} className="cl-item">
              <div className="cl-item-left">
                <span className="cl-index">{i + 1}</span>
                <span className="cl-name" style={{ color: TYPE_COLOR[effectiveType] }}>
                  {TYPE_EMOJI[effectiveType]} {effectiveType}
                </span>
                <span className="cl-shape">{c.sourceShape}</span>
              </div>
              <select
                className="cl-select"
                value={effectiveType}
                style={{ '--accent': TYPE_COLOR[effectiveType] }}
                onChange={e => onOverride(c.id, e.target.value)}
              >
                {TYPES.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          )
        })}
      </div>
    </div>
  )
}
