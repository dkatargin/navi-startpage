import { describe, it, expect } from 'vitest'
import { DEFAULT_CONFIG } from '../config/defaults'

describe('DEFAULT_CONFIG', () => {
  it('has at least one category with links', () => {
    expect(DEFAULT_CONFIG.categories.length).toBeGreaterThan(0)
    DEFAULT_CONFIG.categories.forEach((cat) => {
      expect(cat.id).toBeTruthy()
      expect(cat.label).toBeTruthy()
      expect(cat.links.length).toBeGreaterThan(0)
      cat.links.forEach((link) => {
        expect(link.title).toBeTruthy()
        expect(link.url).toMatch(/^https?:\/\//)
      })
    })
  })

  it('has a search fallback URL with %s placeholder', () => {
    expect(DEFAULT_CONFIG.search.fallbackUrl).toContain('%s')
  })

  it('has dark and light palettes with all required colors', () => {
    const requiredKeys = ['backgroundColor', 'textColor', 'accentColor', 'accentSecondary', 'borderColor']
    for (const key of requiredKeys) {
      expect(DEFAULT_CONFIG.theme.dark).toHaveProperty(key)
      expect(DEFAULT_CONFIG.theme.light).toHaveProperty(key)
    }
  })

  it('defaults to dark mode', () => {
    expect(DEFAULT_CONFIG.theme.mode).toBe('dark')
  })
})
