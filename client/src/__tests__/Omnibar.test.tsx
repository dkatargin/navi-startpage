import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/preact'
import { Omnibar } from '../components/Omnibar'
import * as search from '../services/search'

vi.mock('../services/search')

const fallbackUrl = 'https://kagi.com/search?q=%s'

describe('Omnibar', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.mocked(search.searchBookmarks).mockResolvedValue([])
    vi.mocked(search.searchHistory).mockResolvedValue([])
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders an input with placeholder', () => {
    render(<Omnibar fallbackUrl={fallbackUrl} />)

    const input = screen.getByPlaceholderText('> search_')
    expect(input).toBeTruthy()
  })

  it('does not search with fewer than 2 characters', async () => {
    render(<Omnibar fallbackUrl={fallbackUrl} />)
    const input = screen.getByPlaceholderText('> search_')

    fireEvent.input(input, { target: { value: 'g' } })
    await vi.advanceTimersByTimeAsync(200)

    expect(search.searchBookmarks).not.toHaveBeenCalled()
  })

  it('searches bookmarks and history after debounce with 2+ chars', async () => {
    vi.mocked(search.searchBookmarks).mockResolvedValue([
      { title: 'GitHub', url: 'https://github.com', source: 'bookmark' },
    ])

    render(<Omnibar fallbackUrl={fallbackUrl} />)
    const input = screen.getByPlaceholderText('> search_')

    fireEvent.input(input, { target: { value: 'gi' } })
    await vi.advanceTimersByTimeAsync(150)

    expect(search.searchBookmarks).toHaveBeenCalledWith('gi')
    expect(search.searchHistory).toHaveBeenCalledWith('gi')

    await waitFor(() => {
      expect(screen.getByText('GitHub')).toBeTruthy()
    })
  })

  it('shows section labels when results exist', async () => {
    vi.mocked(search.searchBookmarks).mockResolvedValue([
      { title: 'GitHub', url: 'https://github.com', source: 'bookmark' },
    ])
    vi.mocked(search.searchHistory).mockResolvedValue([
      { title: 'GitLab', url: 'https://gitlab.com', source: 'history' },
    ])

    render(<Omnibar fallbackUrl={fallbackUrl} />)
    const input = screen.getByPlaceholderText('> search_')

    fireEvent.input(input, { target: { value: 'gi' } })
    await vi.advanceTimersByTimeAsync(150)

    await waitFor(() => {
      expect(screen.getByText('[ BOOKMARKS ]')).toBeTruthy()
      expect(screen.getByText('[ HISTORY ]')).toBeTruthy()
      expect(screen.getByText('[ KAGI ]')).toBeTruthy()
    })
  })

  it('always shows Kagi fallback with query text', async () => {
    render(<Omnibar fallbackUrl={fallbackUrl} />)
    const input = screen.getByPlaceholderText('> search_')

    fireEvent.input(input, { target: { value: 'test query' } })
    await vi.advanceTimersByTimeAsync(150)

    await waitFor(() => {
      expect(screen.getByText(/Search "test query" in Kagi/)).toBeTruthy()
    })
  })

  it('clears results and input on Escape', async () => {
    vi.mocked(search.searchBookmarks).mockResolvedValue([
      { title: 'GitHub', url: 'https://github.com', source: 'bookmark' },
    ])

    render(<Omnibar fallbackUrl={fallbackUrl} />)
    const input = screen.getByPlaceholderText('> search_') as HTMLInputElement

    fireEvent.input(input, { target: { value: 'gi' } })
    await vi.advanceTimersByTimeAsync(150)

    await waitFor(() => {
      expect(screen.getByText('GitHub')).toBeTruthy()
    })

    fireEvent.keyDown(input, { key: 'Escape' })

    expect(input.value).toBe('')
    expect(screen.queryByText('GitHub')).toBeNull()
  })

  it('navigates results with ArrowDown/ArrowUp', async () => {
    vi.mocked(search.searchBookmarks).mockResolvedValue([
      { title: 'GitHub', url: 'https://github.com', source: 'bookmark' },
      { title: 'GitLab', url: 'https://gitlab.com', source: 'bookmark' },
    ])

    render(<Omnibar fallbackUrl={fallbackUrl} />)
    const input = screen.getByPlaceholderText('> search_')

    fireEvent.input(input, { target: { value: 'gi' } })
    await vi.advanceTimersByTimeAsync(150)

    await waitFor(() => {
      expect(screen.getByText('GitHub')).toBeTruthy()
    })

    fireEvent.keyDown(input, { key: 'ArrowDown' })
    // First result should have active class
    const firstItem = screen.getByText('GitHub').closest('[data-index]')
    expect(firstItem?.getAttribute('data-active')).toBe('true')

    fireEvent.keyDown(input, { key: 'ArrowDown' })
    const secondItem = screen.getByText('GitLab').closest('[data-index]')
    expect(secondItem?.getAttribute('data-active')).toBe('true')

    fireEvent.keyDown(input, { key: 'ArrowUp' })
    expect(firstItem?.getAttribute('data-active')).toBe('true')
  })
})
