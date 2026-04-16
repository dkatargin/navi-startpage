import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/preact'
import { App } from '../components/App'
import * as storage from '../services/storage'
import { DEFAULT_CONFIG } from '../config/defaults'

vi.mock('../services/storage')

describe('App', () => {
  beforeEach(() => {
    vi.mocked(storage.getConfig).mockResolvedValue(DEFAULT_CONFIG)
    document.documentElement.style.cssText = ''
  })

  it('shows nothing while loading config', () => {
    vi.mocked(storage.getConfig).mockReturnValue(new Promise(() => {}))
    const { container } = render(<App />)

    expect(container.textContent).toBe('')
  })

  it('renders title, grid, and status bar after config loads', async () => {
    render(<App />)

    await waitFor(() => {
      expect(screen.getByText('NAVI')).toBeTruthy()
      expect(screen.getByText(/SYSTEM: ONLINE/)).toBeTruthy()
      expect(screen.getByPlaceholderText('> search_')).toBeTruthy()
    })
  })

  it('applies dark theme CSS variables', async () => {
    render(<App />)

    await waitFor(() => {
      const root = document.documentElement
      expect(root.style.getPropertyValue('--bg-color')).toBe('#0A0A0A')
      expect(root.style.getPropertyValue('--text-color')).toBe('#CCCCCC')
      expect(root.style.getPropertyValue('--accent-color')).toBe('#00FF41')
      expect(root.style.getPropertyValue('--border-color')).toBe('#222222')
    })
  })

  it('applies light theme when mode is light', async () => {
    const lightConfig = {
      ...DEFAULT_CONFIG,
      theme: { ...DEFAULT_CONFIG.theme, mode: 'light' as const },
    }
    vi.mocked(storage.getConfig).mockResolvedValue(lightConfig)

    render(<App />)

    await waitFor(() => {
      const root = document.documentElement
      expect(root.style.getPropertyValue('--bg-color')).toBe('#F0F0F0')
      expect(root.style.getPropertyValue('--accent-color')).toBe('#007F20')
    })
  })

  it('uses system preference when mode is system', async () => {
    const systemConfig = {
      ...DEFAULT_CONFIG,
      theme: { ...DEFAULT_CONFIG.theme, mode: 'system' as const },
    }
    vi.mocked(storage.getConfig).mockResolvedValue(systemConfig)

    render(<App />)

    await waitFor(() => {
      // setup.ts mocks matchMedia to return matches=true for prefers-color-scheme: dark
      const root = document.documentElement
      expect(root.style.getPropertyValue('--bg-color')).toBe('#0A0A0A')
    })
  })

  it('renders SETTINGS button in StatusBar', async () => {
    render(<App />)
    await waitFor(() => {
      expect(screen.getByText(/SETTINGS/)).toBeTruthy()
    })
  })
})
