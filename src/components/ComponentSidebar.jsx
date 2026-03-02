import { useState } from 'react'
import { COMPONENT_TYPES, TYPE_ACCENT } from '../lib/componentModel'
import './ComponentSidebar.css'

const PUBLIC_COMPONENT_TYPES = COMPONENT_TYPES.filter(type => !['VisualClone', 'SemanticNode'].includes(type))

const TYPE_DESC = {
  Button:  'Clickable action',
  Card:    'Content container',
  Slider:  'Range control',
  Input:   'Text field',
  Badge:   'Status label',
  Divider: 'Visual separator',
  Nav:     'Navigation bar',
  Hero:    'Primary spotlight',
  Section: 'Content region',
}

function SidebarSwatch({ type }) {
  const accent = TYPE_ACCENT[type] ?? '#6366f1'

  switch (type) {
    case 'Button':
      return (
        <div className="sb-swatch">
          <div style={{ background: `linear-gradient(135deg, ${accent}, #4338ca)`, color: '#fff', borderRadius: 6, padding: '4px 10px', fontSize: 8, fontWeight: 700, textAlign: 'center', boxShadow: '0 1px 4px rgba(0,0,0,.12)' }}>Click me</div>
        </div>
      )
    case 'Card':
      return (
        <div className="sb-swatch">
          <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 6, padding: '4px 6px', boxShadow: '0 1px 4px rgba(0,0,0,.05)', width: '100%' }}>
            <div style={{ fontSize: 7, fontWeight: 700, color: '#0f172a', marginBottom: 1 }}>Card</div>
            <div style={{ fontSize: 5.5, color: '#64748b', lineHeight: 1.2 }}>Styled content</div>
          </div>
        </div>
      )
    case 'Slider':
      return (
        <div className="sb-swatch">
          <div style={{ width: '100%', padding: '2px 0' }}>
            <div style={{ height: 3, borderRadius: 2, background: '#e2e8f0', position: 'relative' }}>
              <div style={{ width: '65%', height: '100%', borderRadius: 2, background: accent }} />
              <div style={{ position: 'absolute', right: '35%', top: -2, width: 7, height: 7, borderRadius: '50%', background: accent, border: '1.5px solid #fff', boxShadow: '0 1px 3px rgba(0,0,0,.15)' }} />
            </div>
          </div>
        </div>
      )
    case 'Input':
      return (
        <div className="sb-swatch">
          <div style={{ background: '#fff', border: '1px solid #cbd5e1', borderRadius: 5, padding: '3px 6px', display: 'flex', alignItems: 'center', gap: 3, width: '100%' }}>
            <span style={{ width: 1.5, height: 8, background: accent, borderRadius: 1 }} />
            <span style={{ fontSize: 6.5, color: '#94a3b8' }}>Type…</span>
          </div>
        </div>
      )
    case 'Badge':
      return (
        <div className="sb-swatch" style={{ justifyContent: 'center' }}>
          <div style={{ background: `${accent}1a`, border: `1px solid ${accent}44`, borderRadius: 999, padding: '2px 8px' }}>
            <span style={{ fontSize: 7, fontWeight: 700, color: accent }}>New</span>
          </div>
        </div>
      )
    case 'Divider':
      return (
        <div className="sb-swatch" style={{ justifyContent: 'center', padding: '6px 0' }}>
          <div style={{ width: '100%', height: 1.5, borderRadius: 1, background: 'linear-gradient(90deg, transparent, #cbd5e1, transparent)' }} />
        </div>
      )
    case 'Nav':
      return (
        <div className="sb-swatch">
          <div style={{ background: '#0f172a', borderRadius: 4, padding: '3px 6px', display: 'flex', alignItems: 'center', gap: 4, width: '100%' }}>
            <span style={{ fontSize: 6, fontWeight: 800, color: '#f1f5f9' }}>Brand</span>
            <div style={{ display: 'flex', gap: 4, marginLeft: 'auto' }}>
              <span style={{ fontSize: 5, color: '#94a3b8' }}>Home</span>
              <span style={{ fontSize: 5, color: '#94a3b8' }}>About</span>
            </div>
          </div>
        </div>
      )
    case 'Hero':
      return (
        <div className="sb-swatch">
          <div style={{ background: 'linear-gradient(135deg, #1e3a8a, #3b82f6)', borderRadius: 5, padding: '4px', textAlign: 'center', width: '100%' }}>
            <div style={{ fontSize: 7, fontWeight: 800, color: '#fff' }}>Headline</div>
            <div style={{ fontSize: 5, color: 'rgba(255,255,255,.6)', marginTop: 1 }}>Subtext</div>
          </div>
        </div>
      )
    case 'Section':
      return (
        <div className="sb-swatch">
          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 5, padding: '4px 6px', width: '100%' }}>
            <div style={{ fontSize: 6, fontWeight: 700, color: '#0f172a', marginBottom: 1 }}>Section</div>
            <div style={{ fontSize: 5, color: '#64748b' }}>Content area</div>
          </div>
        </div>
      )
    default:
      return <div className="sb-swatch" />
  }
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
            {PUBLIC_COMPONENT_TYPES.map(type => (
              <div
                key={type}
                className={`sidebar-item ${dragging === type ? 'sidebar-item-dragging' : ''}`}
                draggable
                onDragStart={e => handleDragStart(e, type)}
                onDragEnd={handleDragEnd}
                style={{ '--accent': TYPE_ACCENT[type] }}
              >
                <SidebarSwatch type={type} />
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
