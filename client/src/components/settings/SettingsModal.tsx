import { useState } from 'preact/hooks'
import type { NaviConfig } from '../../types/config'
import { CategoriesEditor } from './CategoriesEditor'
import { FeedSettings } from './FeedSettings'
import { SearchSettings } from './SearchSettings'
import { ThemeSettings } from './ThemeSettings'
import styles from './SettingsModal.module.css'
import shared from './settings.module.css'

interface Props {
  config: NaviConfig
  onSave: (config: NaviConfig) => void
  onClose: () => void
}

function isConfigValid(config: NaviConfig): boolean {
  for (const cat of config.categories) {
    if (!cat.label.trim()) return false
    for (const link of cat.links) {
      if (!link.title.trim()) return false
      if (!link.url.trim()) return false
    }
  }
  return true
}

export function SettingsModal({ config, onSave, onClose }: Props) {
  const [draft, setDraft] = useState<NaviConfig>(structuredClone(config))

  const valid = isConfigValid(draft)

  return (
    <div class={styles.overlay} onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div class={styles.modal}>
        <div class={styles.header}>
          <span class={styles.title}>[ SETTINGS ]</span>
          <span class={styles.close} onClick={onClose}>[ ESC ]</span>
        </div>

        <div class={styles.body}>
          <div class={styles.section}>
            <div class={shared.sectionLabel}>[ CATEGORIES ]</div>
            <CategoriesEditor
              categories={draft.categories}
              onChange={(categories) => setDraft((d) => ({ ...d, categories }))}
            />
          </div>

          <div class={styles.section}>
            <div class={shared.sectionLabel}>[ SEARCH ]</div>
            <SearchSettings
              fallbackUrl={draft.search.fallbackUrl}
              onChange={(fallbackUrl) =>
                setDraft((d) => ({ ...d, search: { ...d.search, fallbackUrl } }))
              }
            />
          </div>

          <div class={styles.section}>
            <div class={shared.sectionLabel}>[ FEED ]</div>
            <FeedSettings
              feed={draft.feed}
              feedCollapsed={draft.layout.feedCollapsed}
              onFeedChange={(feed) => setDraft((d) => ({ ...d, feed }))}
              onFeedCollapsedChange={(feedCollapsed) =>
                setDraft((d) => ({ ...d, layout: { ...d.layout, feedCollapsed } }))
              }
            />
          </div>

          <div class={styles.section}>
            <div class={shared.sectionLabel}>[ LAYOUT ]</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: 'var(--text-color)', opacity: 0.4, fontSize: '11px', width: '120px' }}>
                grid columns
              </span>
              <input
                class={shared.input}
                type="number"
                min={1}
                max={8}
                value={draft.layout.gridColumns}
                style={{ width: '70px' }}
                onInput={(e) => {
                  const v = parseInt((e.target as HTMLInputElement).value, 10)
                  if (v >= 1 && v <= 8) setDraft((d) => ({ ...d, layout: { ...d.layout, gridColumns: v } }))
                }}
              />
            </div>
          </div>

          <div class={styles.section}>
            <div class={shared.sectionLabel}>[ THEME ]</div>
            <ThemeSettings
              theme={draft.theme}
              onChange={(theme) => setDraft((d) => ({ ...d, theme }))}
            />
          </div>
        </div>

        <div class={styles.footer}>
          <button class={shared.btn} onClick={onClose}>
            [ CANCEL ]
          </button>
          <button
            class={`${shared.btn} ${shared.btnPrimary}`}
            disabled={!valid}
            onClick={() => onSave(draft)}
          >
            [ APPLY ]
          </button>
        </div>
      </div>
    </div>
  )
}
