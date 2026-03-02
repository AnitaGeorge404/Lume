import { useState } from 'react'
import { COMPONENT_TYPES, TYPE_ACCENT, TYPE_EMOJI } from '../lib/componentModel'
import './ComponentSidebar.css'

const TYPE_DESC = {
  Button:  'Clickable action',
  Card:    'Content container',
  Slider:  'Range control',
  Input:   'Text field',
  Badge:   'Status label',
  Divider: 'Visual separator',
}

export function ComponentSidebar({ collapsed, onToggle }) {
  const [dragging, setDragging] = useState(null)

  const handleDragStart = (e, type) => {
    e.dataTransfer.setData('lume/component-type', type)
    e.dataTransfer.effectAllowed = 'copy'
    setDragging(type)
  }

  const handleDragEnd = () => setDragging(null)

  return (
    <aside className={`component-sidebar ${collapsed ? 'sidebar-collapsed' : ''}`}>
      <button
        className="sidebar-toggle"
        onClick={onToggle}
        title={collapsed ? 'Expand component sidebar' : 'Collapse sidebar'}
      >
        {collapsed ? '›' : '‹'}
      </button>

      {!collapsed && (
        <>
          <div className="sidebar-header">
            <span className="sidebar-title">Components</span>
            <span className="sidebar-hint">Drag onto canvas</span>
          </div>

          <div className="sidebar-items">
            {COMPONENT_TYPES.map(type => (
              <div
                key={type}
                className={`sidebar-item ${dragging === type ? 'sidebar-item-dragging' : ''}`}
                draggable
                onDragStart={e => handleDragStart(e, type)}
                onDragEnd={handleDragEnd}
                style={{ '--accent': TYPE_ACCENT[type] }}
              >
                <span className="sidebar-item-emoji">{TYPE_EMOJI[type]}</span>
                <div className="sidebar-item-text">
                  <span className="sidebar-item-label">{type}</span>
                  <span className="sidebar-item-desc">{TYPE_DESC[type]}</span>
                </div>
                <span className="sidebar-item-drag-handle" aria-hidden="true">⠿</span>
              </div>
            ))}
          </div>

          <div className="sidebar-footer">
            <span className="sidebar-footer-hint">✦ Drawing has priority</span>
          </div>
        </>
      )}
    </aside>
  )
}
