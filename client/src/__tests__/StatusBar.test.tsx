import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/preact'
import { StatusBar } from '../components/StatusBar'

describe('StatusBar', () => {
  it('shows LOCAL MODE when feed is not enabled', () => {
    render(<StatusBar onSettingsClick={() => {}} feedStatus="local" />)
    expect(screen.getByText(/LOCAL MODE/)).toBeTruthy()
  })

  it('shows feed item count when connected', () => {
    render(<StatusBar onSettingsClick={() => {}} feedStatus="online" feedCount={42} />)
    expect(screen.getByText(/FEED: 42 items/)).toBeTruthy()
  })

  it('shows FEED: OFFLINE when feed is unreachable', () => {
    render(<StatusBar onSettingsClick={() => {}} feedStatus="offline" />)
    expect(screen.getByText(/FEED: OFFLINE/)).toBeTruthy()
  })

  it('calls onSettingsClick', () => {
    const onClick = vi.fn()
    render(<StatusBar onSettingsClick={onClick} feedStatus="local" />)
    fireEvent.click(screen.getByText(/SETTINGS/))
    expect(onClick).toHaveBeenCalledOnce()
  })
})
