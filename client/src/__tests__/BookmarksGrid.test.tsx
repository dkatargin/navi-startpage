import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/preact'
import { BookmarksGrid } from '../components/BookmarksGrid'
import type { NaviCategory } from '../types/config'

const mockCategories: NaviCategory[] = [
  {
    id: 'dev',
    label: 'DEV',
    links: [
      { title: 'GitHub', url: 'https://github.com' },
      { title: 'GitLab', url: 'https://gitlab.com', icon: '🦊' },
      { title: 'Sentry', url: 'https://sentry.io', icon: 'https://sentry.io/favicon.ico' },
    ],
  },
  {
    id: 'tools',
    label: 'TOOLS',
    links: [
      { title: 'Kagi', url: 'https://kagi.com' },
    ],
  },
]

describe('BookmarksGrid', () => {
  it('renders category labels with expand indicator', () => {
    render(<BookmarksGrid categories={mockCategories} />)

    expect(screen.getByText(/▾ DEV/)).toBeTruthy()
    expect(screen.getByText(/▾ TOOLS/)).toBeTruthy()
  })

  it('renders all links as anchors', () => {
    render(<BookmarksGrid categories={mockCategories} />)

    const github = screen.getByText('GitHub')
    expect(github.closest('a')).toBeTruthy()
    expect(github.closest('a')!.getAttribute('href')).toBe('https://github.com')
  })

  it('renders emoji icon as text span', () => {
    render(<BookmarksGrid categories={mockCategories} />)

    expect(screen.getByText('🦊')).toBeTruthy()
  })

  it('renders URL icon as img with 16x16 size', () => {
    render(<BookmarksGrid categories={mockCategories} />)

    const img = screen.getByAltText('Sentry') as HTMLImageElement
    expect(img.tagName).toBe('IMG')
    expect(img.getAttribute('src')).toBe('https://sentry.io/favicon.ico')
    expect(img.getAttribute('width')).toBe('16')
    expect(img.getAttribute('height')).toBe('16')
  })

  it('renders links without icon (no icon element)', () => {
    render(<BookmarksGrid categories={mockCategories} />)

    const github = screen.getByText('GitHub')
    const listItem = github.closest('li')!
    const imgs = listItem.querySelectorAll('img')
    expect(imgs).toHaveLength(0)
  })

  it('renders empty state when no categories', () => {
    const { container } = render(<BookmarksGrid categories={[]} />)

    expect(container.textContent).toBe('')
  })

  it('collapses links on label click', () => {
    render(<BookmarksGrid categories={mockCategories} />)

    expect(screen.getByText('GitHub')).toBeTruthy()

    fireEvent.click(screen.getByText(/▾ DEV/))

    expect(screen.queryByText('GitHub')).toBeNull()
    expect(screen.getByText(/▸ DEV/)).toBeTruthy()
  })

  it('expands links on second label click', () => {
    render(<BookmarksGrid categories={mockCategories} />)

    fireEvent.click(screen.getByText(/▾ DEV/))
    expect(screen.queryByText('GitHub')).toBeNull()

    fireEvent.click(screen.getByText(/▸ DEV/))
    expect(screen.getByText('GitHub')).toBeTruthy()
  })

  it('starts collapsed when category has collapsed: true', () => {
    const collapsedCategories: NaviCategory[] = [
      { id: 'dev', label: 'DEV', collapsed: true, links: [{ title: 'GitHub', url: 'https://github.com' }] },
    ]

    render(<BookmarksGrid categories={collapsedCategories} />)

    expect(screen.getByText(/▸ DEV/)).toBeTruthy()
    expect(screen.queryByText('GitHub')).toBeNull()
  })

  it('only collapses the clicked category', () => {
    render(<BookmarksGrid categories={mockCategories} />)

    fireEvent.click(screen.getByText(/▾ DEV/))

    expect(screen.queryByText('GitHub')).toBeNull()
    expect(screen.getByText('Kagi')).toBeTruthy()
  })

  it('shows first 5 links and "more" for long lists', () => {
    const longCategory: NaviCategory[] = [
      {
        id: 'lab',
        label: 'LAB',
        links: Array.from({ length: 8 }, (_, i) => ({
          title: `Service ${i + 1}`,
          url: `https://s${i + 1}.local`,
        })),
      },
    ]

    render(<BookmarksGrid categories={longCategory} />)

    expect(screen.getByText('Service 1')).toBeTruthy()
    expect(screen.getByText('Service 5')).toBeTruthy()
    expect(screen.queryByText('Service 6')).toBeNull()
    expect(screen.getByText('... +3 more')).toBeTruthy()
  })

  it('reveals all links when "more" is clicked', () => {
    const longCategory: NaviCategory[] = [
      {
        id: 'lab',
        label: 'LAB',
        links: Array.from({ length: 8 }, (_, i) => ({
          title: `Service ${i + 1}`,
          url: `https://s${i + 1}.local`,
        })),
      },
    ]

    render(<BookmarksGrid categories={longCategory} />)

    fireEvent.click(screen.getByText('... +3 more'))

    expect(screen.getByText('Service 6')).toBeTruthy()
    expect(screen.getByText('Service 8')).toBeTruthy()
    expect(screen.queryByText('... +3 more')).toBeNull()
  })

  it('does not show "more" for short lists', () => {
    render(<BookmarksGrid categories={mockCategories} />)

    expect(screen.queryByText(/more/)).toBeNull()
  })
})
