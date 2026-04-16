export interface FeedItem {
  title: string
  url: string
  source: string
  source_name: string
  category: string
  date: string
  preview: string
}

export interface FeedResponse {
  items: FeedItem[]
  categories: string[]
  updated_at: string
}

const EMPTY_RESPONSE: FeedResponse = { items: [], categories: [], updated_at: '' }
const TIMEOUT_MS = 3000

export async function fetchFeed(
  baseUrl: string,
  token: string,
  source?: string,
  category?: string,
): Promise<FeedResponse> {
  try {
    const params = new URLSearchParams()
    if (source) params.set('source', source)
    if (category) params.set('category', category)

    const query = params.toString()
    const url = `${baseUrl}/api/feed${query ? '?' + query : ''}`

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS)

    const resp = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
      signal: controller.signal,
    })

    clearTimeout(timeout)

    if (!resp.ok) return EMPTY_RESPONSE

    return await resp.json()
  } catch {
    return EMPTY_RESPONSE
  }
}
