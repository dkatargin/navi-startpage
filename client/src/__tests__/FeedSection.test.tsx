import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/preact'
import { FeedSection } from '../components/FeedSection'
import type { FeedItem } from '../services/feed'

const mockItems: FeedItem[] = [
  { title: 'HN Post', url: 'https://hn.com/1', source: 'hn', category: 'NEWS', date: '2026-04-16T10:00:00Z', preview: '' },
  { title: 'RSS Post', url: 'https://blog.com/1', source: 'rss', category: 'NEWS', date: '2026-04-16T09:00:00Z', preview: 'desc' },
  { title: 'Reddit Post', url: 'https://reddit.com/1', source: 'reddit', category: 'REDDIT', date: '2026-04-16T08:00:00Z', preview: '' },
]

const mockCategories = ['NEWS', 'REDDIT']

describe('FeedSection', () => {
  it('renders FEEDS header', () => {
    render(<FeedSection items={mockItems} categories={mockCategories} gridColumns={4} defaultCollapsed={false} />)
    expect(screen.getByText(/FEEDS/)).toBeTruthy()
  })

  it('renders category labels', () => {
    render(<FeedSection items={mockItems} categories={mockCategories} gridColumns={4} defaultCollapsed={false} />)
    expect(screen.getByText('[ NEWS ]')).toBeTruthy()
    expect(screen.getByText('[ REDDIT ]')).toBeTruthy()
  })

  it('renders feed item titles as links', () => {
    render(<FeedSection items={mockItems} categories={mockCategories} gridColumns={4} defaultCollapsed={false} />)
    const link = screen.getByText('HN Post')
    expect(link.closest('a')?.getAttribute('href')).toBe('https://hn.com/1')
  })

  it('renders source badges', () => {
    render(<FeedSection items={mockItems} categories={mockCategories} gridColumns={4} defaultCollapsed={false} />)
    expect(screen.getByText('hn')).toBeTruthy()
    expect(screen.getByText('reddit')).toBeTruthy()
  })

  it('collapses on header click', () => {
    render(<FeedSection items={mockItems} categories={mockCategories} gridColumns={4} defaultCollapsed={false} />)
    expect(screen.getByText('HN Post')).toBeTruthy()
    fireEvent.click(screen.getByText(/FEEDS/))
    expect(screen.queryByText('HN Post')).toBeNull()
    expect(screen.getByText(/▸ FEEDS/)).toBeTruthy()
  })

  it('starts collapsed when defaultCollapsed is true', () => {
    render(<FeedSection items={mockItems} categories={mockCategories} gridColumns={4} defaultCollapsed={true} />)
    expect(screen.getByText(/▸ FEEDS/)).toBeTruthy()
    expect(screen.queryByText('HN Post')).toBeNull()
  })

  it('groups items by category', () => {
    const { container } = render(
      <FeedSection items={mockItems} categories={mockCategories} gridColumns={4} defaultCollapsed={false} />,
    )
    const columns = container.querySelectorAll('[data-feed-category]')
    expect(columns).toHaveLength(2)
  })
})
