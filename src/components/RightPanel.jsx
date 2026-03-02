import { ComponentList } from './ComponentList'
import { PRESETS } from '../lib/copilot'
import './RightPanel.css'

const RIGHT_TABS = [
  { id: 'preview',   icon: '▶',  label: 'Preview'  },
  { id: 'code',      icon: '</>', label: 'Code'     },
  { id: 'ai',        icon: '✦',  label: 'AI'       },
  { id: 'inspector', icon: '≡',  label: 'Inspector'},
]

export function RightPanel({
  // shared state
  components, profile, interpreted, typeOverrides, onOverride,
  // code
  jsx, css, themeJs, combined, codeSubTab, onCodeSubTab,
  copyState, onCopy, onCopyJsx, onCopyCss, onDownload,
  // ai copilot
  draftPrompt, onDraftChange, onApplyPrompt, appliedPrompt,
  copilotHistory, onUndoCopilot, onResetPrompt, changeSummary,
  dominantProfile, sessionCount, onClearMemory,
  // tab state (lifted to App so canvas/preview stay in sync)
  activeTab, onTabChange,
  frameworkTag, styleTags,
}) {
  return (
    <aside className="right-panel">
      {/* ── Tab bar ─────────────────────────────────────────────────────── */}
      <div className="rp-tabbar">
        {RIGHT_TABS.map(t => (
          <button
            key={t.id}
            className={`rp-tab ${activeTab === t.id ? 'active' : ''}`}
            onClick={() => onTabChange(t.id)}
          >
            <span className="rp-tab-icon">{t.icon}</span>
            <span className="rp-tab-label">{t.label}</span>
          </button>
        ))}
      </div>

      {/* ── Tab content ─────────────────────────────────────────────────── */}

      {/* Preview */}
      {activeTab === 'preview' && (
        <div className="rp-body rp-preview-body">
          <section className="rp-preview-hub">
            <p className="rp-preview-kicker">Center Preview Active</p>
            <h3 className="rp-preview-title">Live output is shown in the main workspace</h3>
            <p className="rp-preview-sub">Use this panel for context and quick status while the bottom-center preview stays interactive.</p>

            <div className="rp-preview-meta">
              <span className="rp-mini-chip">{components.length} component{components.length !== 1 ? 's' : ''}</span>
              <span className="rp-mini-chip fw">⟨/⟩ {frameworkTag ?? 'React'}</span>
              {(styleTags ?? []).slice(0, 3).map(tag => (
                <span key={tag} className="rp-mini-chip style">✦ {tag}</span>
              ))}
            </div>

            <div className="rp-preview-status-grid">
              <article className="rp-status-card">
                <span>Canvas Sync</span>
                <strong>Live</strong>
              </article>
              <article className="rp-status-card">
                <span>Output Quality</span>
                <strong>Enhanced</strong>
              </article>
              <article className="rp-status-card">
                <span>Design Mood</span>
                <strong>{profile?.mood ?? 'default'}</strong>
              </article>
            </div>
          </section>
        </div>
      )}

      {/* Code */}
      {activeTab === 'code' && (
        <div className="rp-body rp-code-body">
          {/* Sub-tab + action bar */}
          <div className="rp-code-toolbar">
            <div className="rp-subtab-row">
              {['combined', 'jsx', 'css', 'theme'].map(sub => (
                <button
                  key={sub}
                  className={`rp-subtab ${codeSubTab === sub ? 'active' : ''}`}
                  onClick={() => onCodeSubTab(sub)}
                >
                  {sub === 'combined' ? 'All' : sub === 'theme' ? 'Tokens' : sub.toUpperCase()}
                </button>
              ))}
            </div>
            <div className="rp-code-actions">
              <button className="rp-action-btn" onClick={onCopy}>
                {copyState === 'Copied!' ? '✓ Copied' : '📋 Copy'}
              </button>
              <button className="rp-action-btn ghost" onClick={onDownload}>⬇</button>
            </div>
          </div>

          {/* Export file-tree */}
          {components.length > 0 && (
            <div className="rp-export-tree">
              {[
                { icon: '📄', name: 'GeneratedUI.jsx',     content: jsx,     cKey: 'jsx',   fn: onCopyJsx },
                { icon: '🎨', name: 'generatedStyles.css', content: css,     cKey: 'css',   fn: onCopyCss },
                { icon: '💳', name: 'theme.js',             content: themeJs, cKey: 'theme', fn: () => { navigator.clipboard.writeText(themeJs).catch(()=>{}) } },
              ].map(({ icon, name, content, cKey, fn }) => (
                <div key={name} className="rp-export-row">
                  <span className="rp-export-icon">{icon}</span>
                  <span className="rp-export-name">{name}</span>
                  <span className="rp-export-lines">{content.split('\n').length}L</span>
                  <button className="rp-export-btn" onClick={fn}>
                    {copyState === cKey ? '✓' : 'Copy'}
                  </button>
                </div>
              ))}
            </div>
          )}

          <textarea
            className="rp-code-area"
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

      {/* AI Copilot */}
      {activeTab === 'ai' && (
        <div className="rp-body rp-ai-body">

          {dominantProfile && sessionCount >= 3 && (
            <div className="rp-taste-hint">
              <span>🧠 You prefer <strong>{dominantProfile}</strong></span>
              <button className="rp-taste-clear" onClick={onClearMemory}>×</button>
            </div>
          )}

          <p className="rp-ai-sup">Choose a vibe or describe what you want</p>

          {/* Vibe chips */}
          <div className="rp-preset-chips">
            {PRESETS.map(({ label, prompt }) => (
              <button
                key={label}
                className={`rp-chip ${appliedPrompt === prompt ? 'active' : ''}`}
                onClick={() => {
                  if (appliedPrompt !== prompt) onApplyPrompt(prompt)
                }}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Freeform input */}
          <div className="rp-ai-input-row">
            <input
              className="rp-ai-input"
              value={draftPrompt}
              onChange={e => onDraftChange(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && onApplyPrompt(null)}
              placeholder="describe a feeling, brand, or color mood…"
            />
            <button className="rp-action-btn" onClick={() => onApplyPrompt(null)}>Apply ↵</button>
          </div>

          <div className="rp-ai-undo-row">
            {copilotHistory.length > 0 && (
              <button className="rp-action-btn ghost" onClick={onUndoCopilot}>↩ Undo</button>
            )}
            {appliedPrompt && !copilotHistory.length && (
              <button className="rp-action-btn ghost" onClick={onResetPrompt}>✕ Reset</button>
            )}
          </div>

          {changeSummary && (
            <div className="rp-ai-summary">
              <span className="rp-ai-summary-icon">✦</span>
              {changeSummary}
            </div>
          )}

          {/* Advice box when no components yet */}
          {!components.length && (
            <div className="rp-ai-empty">
              <span className="rp-ai-empty-icon">🎨</span>
              <p>No components yet. Draw or load a template first, then apply a style.</p>
            </div>
          )}
        </div>
      )}

      {/* Component Inspector */}
      {activeTab === 'inspector' && (
        <div className="rp-body rp-inspector-body">
          {interpreted.length ? (
            <>
              <p className="rp-inspector-hint">Override the detected type for any shape</p>
              <ComponentList
                components={interpreted}
                overrides={typeOverrides}
                onOverride={onOverride}
              />
            </>
          ) : (
            <div className="rp-inspector-empty">
              <span>≡</span>
              <p>No components on canvas yet</p>
            </div>
          )}
        </div>
      )}
    </aside>
  )
}
