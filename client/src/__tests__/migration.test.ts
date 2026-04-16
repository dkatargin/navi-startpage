import { describe, it, expect } from 'vitest'
import { migrateConfig } from '../services/storage'
import { DEFAULT_CONFIG } from '../config/defaults'
import type { NaviConfig } from '../types/config'

describe('migrateConfig', () => {
  it('returns defaults when stored config is empty', () => {
    const result = migrateConfig({} as NaviConfig, DEFAULT_CONFIG)
    expect(result).toEqual(DEFAULT_CONFIG)
  })

  it('preserves existing values and fills missing palette fields', () => {
    const oldConfig = {
      ...DEFAULT_CONFIG,
      theme: {
        ...DEFAULT_CONFIG.theme,
        dark: {
          backgroundColor: '#111111',
          textColor: '#EEEEEE',
          accentColor: '#FF0000',
          borderColor: '#333333',
        },
        light: {
          backgroundColor: '#FFFFFF',
          textColor: '#000000',
          accentColor: '#00FF00',
          borderColor: '#CCCCCC',
        },
      },
    }
    const result = migrateConfig(oldConfig as unknown as NaviConfig, DEFAULT_CONFIG)
    expect(result.theme.dark.backgroundColor).toBe('#111111')
    expect(result.theme.dark.accentColor).toBe('#FF0000')
    expect(result.theme.dark.accentSecondary).toBe('#FFB000')
    expect(result.theme.light.accentSecondary).toBe('#B87A00')
  })

  it('does not overwrite existing accentSecondary', () => {
    const config = structuredClone(DEFAULT_CONFIG)
    config.theme.dark.accentSecondary = '#00BFFF'
    const result = migrateConfig(config, DEFAULT_CONFIG)
    expect(result.theme.dark.accentSecondary).toBe('#00BFFF')
  })

  it('preserves categories and search config', () => {
    const config = structuredClone(DEFAULT_CONFIG)
    config.categories = []
    config.search.fallbackUrl = 'https://google.com/search?q=%s'
    const result = migrateConfig(config, DEFAULT_CONFIG)
    expect(result.categories).toEqual([])
    expect(result.search.fallbackUrl).toBe('https://google.com/search?q=%s')
  })
})
