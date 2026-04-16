import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getConfig, saveConfig } from '../services/storage'
import { DEFAULT_CONFIG } from '../config/defaults'

describe('storage service', () => {
  beforeEach(() => {
    vi.mocked(chrome.storage.local.get).mockReset()
    vi.mocked(chrome.storage.local.set).mockReset()
  })

  describe('getConfig', () => {
    it('returns stored config when present', async () => {
      const stored = { ...DEFAULT_CONFIG, categories: [] }
      vi.mocked(chrome.storage.local.get).mockResolvedValue({ config: stored })

      const result = await getConfig()

      expect(chrome.storage.local.get).toHaveBeenCalledWith('config')
      expect(result).toEqual(stored)
    })

    it('writes and returns defaults when storage is empty', async () => {
      vi.mocked(chrome.storage.local.get).mockResolvedValue({})
      vi.mocked(chrome.storage.local.set).mockResolvedValue(undefined)

      const result = await getConfig()

      expect(chrome.storage.local.set).toHaveBeenCalledWith({ config: DEFAULT_CONFIG })
      expect(result).toEqual(DEFAULT_CONFIG)
    })
  })

  describe('saveConfig', () => {
    it('saves config to storage', async () => {
      vi.mocked(chrome.storage.local.set).mockResolvedValue(undefined)

      await saveConfig(DEFAULT_CONFIG)

      expect(chrome.storage.local.set).toHaveBeenCalledWith({ config: DEFAULT_CONFIG })
    })
  })
})
