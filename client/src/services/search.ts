import api from './browser-api'

export interface SearchResult {
  title: string
  url: string
  source: 'bookmark' | 'history'
}

const MAX_RESULTS = 10

export async function searchBookmarks(query: string): Promise<SearchResult[]> {
  if (!api?.bookmarks) return []

  const bookmarks = await api.bookmarks.search(query)

  return bookmarks
    .filter((b) => !!b.url)
    .slice(0, MAX_RESULTS)
    .map((b) => ({
      title: b.title,
      url: b.url!,
      source: 'bookmark' as const,
    }))
}

export async function searchHistory(query: string): Promise<SearchResult[]> {
  if (!api?.history) return []

  const items = await api.history.search({ text: query, maxResults: MAX_RESULTS })

  return items
    .filter((h) => !!h.url && !!h.title)
    .map((h) => ({
      title: h.title!,
      url: h.url!,
      source: 'history' as const,
    }))
}
