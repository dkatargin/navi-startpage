import { useEffect, useState, useRef } from 'preact/hooks'
import type { NaviConfig, ThemePalette } from '../types/config'
import { getConfig, saveConfig } from '../services/storage'
import { fetchFeed } from '../services/feed'
import type { FeedResponse } from '../services/feed'
import { Omnibar } from './Omnibar'
import { BookmarksGrid } from './BookmarksGrid'
import { FeedSection } from './FeedSection'
import { StatusBar } from './StatusBar'
import { SettingsModal } from './settings/SettingsModal'
import styles from './App.module.css'

function getActivePalette(config: NaviConfig): ThemePalette {
  const { theme } = config

  if (theme.mode === 'system') {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    return prefersDark ? theme.dark : theme.light
  }

  return theme[theme.mode]
}

function applyTheme(config: NaviConfig) {
  const palette = getActivePalette(config)
  const root = document.documentElement

  root.style.setProperty('--bg-color', palette.backgroundColor)
  root.style.setProperty('--text-color', palette.textColor)
  root.style.setProperty('--accent-color', palette.accentColor)
  root.style.setProperty('--accent-secondary', palette.accentSecondary)
  root.style.setProperty('--border-color', palette.borderColor)
  root.style.setProperty('--font-family', config.theme.fontFamily)
  root.style.setProperty('--font-size', `${config.theme.fontSize}px`)
}

export function App() {
  const [config, setConfig] = useState<NaviConfig | null>(null)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [feedData, setFeedData] = useState<FeedResponse | null>(null)
  const [feedStatus, setFeedStatus] = useState<'local' | 'online' | 'offline'>('local')
  const omnibarRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    getConfig().then((cfg) => {
      setConfig(cfg)
      applyTheme(cfg)
    })
  }, [])

  useEffect(() => {
    if (!config || !config.feed.enabled || !config.feed.url) {
      setFeedStatus('local')
      setFeedData(null)
      return
    }

    const loadFeed = async () => {
      const data = await fetchFeed(config.feed.url, config.feed.token)
      if (data.items.length > 0 || data.categories.length > 0) {
        setFeedData(data)
        setFeedStatus('online')
      } else {
        setFeedStatus('offline')
      }
    }

    loadFeed()
  }, [config?.feed.enabled, config?.feed.url, config?.feed.token])

  useEffect(() => {
    if (!config || config.theme.mode !== 'system') return

    const mql = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = () => applyTheme(config)
    mql.addEventListener('change', handler)
    return () => mql.removeEventListener('change', handler)
  }, [config])

  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return

      if (settingsOpen) {
        if (e.key === 'Escape') {
          e.preventDefault()
          setSettingsOpen(false)
        }
        return
      }

      if (e.key === ',') {
        e.preventDefault()
        setSettingsOpen(true)
        return
      }

      if (e.key.length === 1 && document.activeElement !== omnibarRef.current) {
        omnibarRef.current?.focus()
      }
    }

    document.addEventListener('keydown', handleGlobalKeyDown)
    return () => document.removeEventListener('keydown', handleGlobalKeyDown)
  }, [settingsOpen])

  const handleSaveConfig = async (updated: NaviConfig) => {
    await saveConfig(updated)
    setConfig(updated)
    applyTheme(updated)
    setSettingsOpen(false)
  }

  if (!config) return null

  return (
    <div class={styles.container}>
      <h1 class={styles.title}>NAVI</h1>
      <Omnibar fallbackUrl={config.search.fallbackUrl} inputRef={omnibarRef} />
      <BookmarksGrid categories={config.categories} gridColumns={config.layout.gridColumns} />
      {config.feed.enabled && feedData && (
        <FeedSection
          items={feedData.items}
          categories={feedData.categories}
          gridColumns={config.layout.gridColumns}
          defaultCollapsed={config.layout.feedCollapsed}
        />
      )}
      <StatusBar
        onSettingsClick={() => setSettingsOpen(true)}
        feedStatus={feedStatus}
        feedCount={feedData?.items.length}
      />
      {settingsOpen && (
        <SettingsModal
          config={config}
          onSave={handleSaveConfig}
          onClose={() => setSettingsOpen(false)}
        />
      )}
    </div>
  )
}
