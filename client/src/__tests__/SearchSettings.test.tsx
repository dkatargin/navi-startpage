import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/preact'
import { SearchSettings } from '../components/settings/SearchSettings'

describe('SearchSettings', () => {
  it('renders input with current fallback URL', () => {
    render(<SearchSettings fallbackUrl="https://kagi.com/search?q=%s" onChange={() => {}} />)
    expect(screen.getByDisplayValue('https://kagi.com/search?q=%s')).toBeTruthy()
  })

  it('calls onChange when URL is edited', () => {
    const onChange = vi.fn()
    render(<SearchSettings fallbackUrl="https://kagi.com/search?q=%s" onChange={onChange} />)
    fireEvent.input(screen.getByDisplayValue('https://kagi.com/search?q=%s'), {
      target: { value: 'https://google.com/search?q=%s' },
    })
    expect(onChange).toHaveBeenCalledWith('https://google.com/search?q=%s')
  })

  it('shows hint about %s placeholder', () => {
    render(<SearchSettings fallbackUrl="https://kagi.com/search?q=%s" onChange={() => {}} />)
    expect(screen.getByText(/Use %s as query placeholder/)).toBeTruthy()
  })

  it('shows warning when %s is missing', () => {
    render(<SearchSettings fallbackUrl="https://kagi.com/search" onChange={() => {}} />)
    expect(screen.getByText(/missing %s/i)).toBeTruthy()
  })
})
