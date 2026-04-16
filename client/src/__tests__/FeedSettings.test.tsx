import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/preact'
import { FeedSettings } from '../components/settings/FeedSettings'
import type { NaviFeed } from '../types/config'

const defaultFeed: NaviFeed = { enabled: false, url: '', token: '' }
const enabledFeed: NaviFeed = { enabled: true, url: 'https://feed.home.lab', token: 'secret' }

describe('FeedSettings', () => {
  it('renders enabled checkbox', () => {
    render(<FeedSettings feed={defaultFeed} feedCollapsed={false} onFeedChange={() => {}} onFeedCollapsedChange={() => {}} />)
    expect(screen.getByLabelText('enabled')).toBeTruthy()
  })

  it('calls onFeedChange when enabled is toggled', () => {
    const onChange = vi.fn()
    render(<FeedSettings feed={defaultFeed} feedCollapsed={false} onFeedChange={onChange} onFeedCollapsedChange={() => {}} />)
    fireEvent.click(screen.getByLabelText('enabled'))
    expect(onChange).toHaveBeenCalledOnce()
    expect(onChange.mock.calls[0][0].enabled).toBe(true)
  })

  it('disables url and token when not enabled', () => {
    render(<FeedSettings feed={defaultFeed} feedCollapsed={false} onFeedChange={() => {}} onFeedCollapsedChange={() => {}} />)
    const urlInput = screen.getByPlaceholderText('https://feed.home.lab')
    expect((urlInput as HTMLInputElement).disabled).toBe(true)
  })

  it('enables url and token when enabled', () => {
    render(<FeedSettings feed={enabledFeed} feedCollapsed={false} onFeedChange={() => {}} onFeedCollapsedChange={() => {}} />)
    const urlInput = screen.getByDisplayValue('https://feed.home.lab')
    expect((urlInput as HTMLInputElement).disabled).toBe(false)
  })

  it('calls onFeedChange when url is edited', () => {
    const onChange = vi.fn()
    render(<FeedSettings feed={enabledFeed} feedCollapsed={false} onFeedChange={onChange} onFeedCollapsedChange={() => {}} />)
    fireEvent.input(screen.getByDisplayValue('https://feed.home.lab'), {
      target: { value: 'https://new.url' },
    })
    expect(onChange).toHaveBeenCalledOnce()
    expect(onChange.mock.calls[0][0].url).toBe('https://new.url')
  })

  it('renders feedCollapsed checkbox', () => {
    render(<FeedSettings feed={enabledFeed} feedCollapsed={true} onFeedChange={() => {}} onFeedCollapsedChange={() => {}} />)
    expect(screen.getByLabelText('collapsed by default')).toBeTruthy()
  })
})
