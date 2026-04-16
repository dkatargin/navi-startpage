import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { fetchFeed } from '../services/feed'
import type { FeedResponse } from '../services/feed'

describe('fetchFeed', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('returns feed data on success', async () => {
    const mockResponse: FeedResponse = {
      items: [
        { title: 'Test', url: 'https://example.com', source: 'rss', category: 'NEWS', date: '2026-04-16T10:00:00Z', preview: '' },
      ],
      categories: ['NEWS'],
      updated_at: '2026-04-16T10:00:00Z',
    }

    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    } as Response)

    const result = await fetchFeed('https://api.example.com', 'test-token')

    expect(fetch).toHaveBeenCalledWith(
      'https://api.example.com/api/feed',
      expect.objectContaining({
        headers: { Authorization: 'Bearer test-token' },
      }),
    )
    expect(result.items).toHaveLength(1)
    expect(result.categories).toEqual(['NEWS'])
  })

  it('passes source and category filters as query params', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ items: [], categories: [], updated_at: '' }),
    } as Response)

    await fetchFeed('https://api.example.com', 'token', 'hn,rss', 'NEWS')

    const calledUrl = vi.mocked(fetch).mock.calls[0][0] as string
    expect(calledUrl).toContain('source=hn%2Crss')
    expect(calledUrl).toContain('category=NEWS')
  })

  it('returns empty response on network error', async () => {
    vi.mocked(fetch).mockRejectedValue(new Error('network error'))

    const result = await fetchFeed('https://api.example.com', 'token')

    expect(result.items).toEqual([])
    expect(result.categories).toEqual([])
  })

  it('returns empty response on non-ok status', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      status: 401,
    } as Response)

    const result = await fetchFeed('https://api.example.com', 'token')

    expect(result.items).toEqual([])
  })
})
