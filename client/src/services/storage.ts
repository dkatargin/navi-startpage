import type { NaviConfig, ThemePalette } from '../types/config'
import { DEFAULT_CONFIG } from '../config/defaults'
import api from './browser-api'

const STORAGE_KEY = 'config'

export function migrateConfig(stored: NaviConfig, defaults: NaviConfig): NaviConfig {
  if (!stored || !stored.theme) return defaults

  const migratePalette = (palette: Partial<ThemePalette>, defaultPalette: ThemePalette): ThemePalette => ({
    ...defaultPalette,
    ...palette,
  })

  return {
    categories: stored.categories ?? defaults.categories,
    search: stored.search ?? defaults.search,
    theme: {
      mode: stored.theme.mode ?? defaults.theme.mode,
      dark: migratePalette(stored.theme.dark ?? {}, defaults.theme.dark),
      light: migratePalette(stored.theme.light ?? {}, defaults.theme.light),
      fontFamily: stored.theme.fontFamily ?? defaults.theme.fontFamily,
      fontSize: stored.theme.fontSize ?? defaults.theme.fontSize,
    },
    layout: {
      gridColumns: stored.layout?.gridColumns ?? defaults.layout.gridColumns,
      feedCollapsed: stored.layout?.feedCollapsed ?? defaults.layout.feedCollapsed,
    },
    feed: {
      enabled: stored.feed?.enabled ?? defaults.feed.enabled,
      url: stored.feed?.url ?? defaults.feed.url,
      token: stored.feed?.token ?? defaults.feed.token,
    },
  }
}

export async function getConfig(): Promise<NaviConfig> {
  if (!api?.storage?.local) {
    return DEFAULT_CONFIG
  }
  const result = await api.storage.local.get(STORAGE_KEY)
  if (result[STORAGE_KEY]) {
    return migrateConfig(result[STORAGE_KEY] as NaviConfig, DEFAULT_CONFIG)
  }
  await api.storage.local.set({ [STORAGE_KEY]: DEFAULT_CONFIG })
  return DEFAULT_CONFIG
}

export async function saveConfig(config: NaviConfig): Promise<void> {
  if (!api?.storage?.local) return
  await api.storage.local.set({ [STORAGE_KEY]: config })
}
