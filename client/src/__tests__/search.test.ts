import { describe, it, expect, vi, beforeEach } from 'vitest'
import { searchBookmarks, searchHistory } from '../services/search'

describe('search service', () => {
  beforeEach(() => {
    vi.mocked(chrome.bookmarks.search).mockReset()
    vi.mocked(chrome.history.search).mockReset()
  })

  describe('searchBookmarks', () => {
    it('maps chrome bookmarks to SearchResult[]', async () => {
      vi.mocked(chrome.bookmarks.search).mockResolvedValue([
        { id: '1', title: 'GitHub', url: 'https://github.com' },
      ] as chrome.bookmarks.BookmarkTreeNode[])

      const results = await searchBookmarks('git')

      expect(chrome.bookmarks.search).toHaveBeenCalledWith('git')
      expect(results).toEqual([
        { title: 'GitHub', url: 'https://github.com', source: 'bookmark' },
      ])
    })

    it('filters out entries without url (folders)', async () => {
      vi.mocked(chrome.bookmarks.search).mockResolvedValue([
        { id: '1', title: 'Dev Folder' } as chrome.bookmarks.BookmarkTreeNode,
        { id: '2', title: 'GitHub', url: 'https://github.com' } as chrome.bookmarks.BookmarkTreeNode,
      ])

      const results = await searchBookmarks('dev')

      expect(results).toHaveLength(1)
      expect(results[0].title).toBe('GitHub')
    })

    it('limits results to 10', async () => {
      const many = Array.from({ length: 20 }, (_, i) => ({
        id: String(i),
        title: `Site ${i}`,
        url: `https://site${i}.com`,
      })) as chrome.bookmarks.BookmarkTreeNode[]
      vi.mocked(chrome.bookmarks.search).mockResolvedValue(many)

      const results = await searchBookmarks('site')

      expect(results).toHaveLength(10)
    })
  })

  describe('searchHistory', () => {
    it('maps chrome history to SearchResult[]', async () => {
      vi.mocked(chrome.history.search).mockResolvedValue([
        { id: '1', title: 'Stack Overflow', url: 'https://stackoverflow.com', visitCount: 5, lastVisitTime: 0, typedCount: 0 },
      ] as chrome.history.HistoryItem[])

      const results = await searchHistory('stack')

      expect(chrome.history.search).toHaveBeenCalledWith({ text: 'stack', maxResults: 10 })
      expect(results).toEqual([
        { title: 'Stack Overflow', url: 'https://stackoverflow.com', source: 'history' },
      ])
    })

    it('filters out entries without url or title', async () => {
      vi.mocked(chrome.history.search).mockResolvedValue([
        { id: '1', url: 'https://example.com', visitCount: 1, lastVisitTime: 0, typedCount: 0 } as chrome.history.HistoryItem,
        { id: '2', title: 'GitHub', url: 'https://github.com', visitCount: 1, lastVisitTime: 0, typedCount: 0 } as chrome.history.HistoryItem,
      ])

      const results = await searchHistory('test')

      expect(results).toHaveLength(1)
      expect(results[0].title).toBe('GitHub')
    })
  })
})
