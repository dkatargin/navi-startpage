import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/preact'
import { ThemeSettings } from '../components/settings/ThemeSettings'
import { DEFAULT_CONFIG } from '../config/defaults'

const theme = DEFAULT_CONFIG.theme

describe('ThemeSettings', () => {
  it('renders mode selector with active button', () => {
    render(<ThemeSettings theme={theme} onChange={() => {}} />)
    expect(screen.getByText('DARK')).toBeTruthy()
    expect(screen.getByText('LIGHT')).toBeTruthy()
    expect(screen.getByText('SYSTEM')).toBeTruthy()
  })

  it('calls onChange with new mode when mode button is clicked', () => {
    const onChange = vi.fn()
    render(<ThemeSettings theme={theme} onChange={onChange} />)
    fireEvent.click(screen.getByText('LIGHT'))
    expect(onChange).toHaveBeenCalledOnce()
    expect(onChange.mock.calls[0][0].mode).toBe('light')
  })

  it('renders dark palette color inputs', () => {
    render(<ThemeSettings theme={theme} onChange={() => {}} />)
    expect(screen.getByText('// DARK PALETTE')).toBeTruthy()
    expect(screen.getByDisplayValue('#0A0A0A')).toBeTruthy()
    expect(screen.getByDisplayValue('#00FF41')).toBeTruthy()
    expect(screen.getByDisplayValue('#FFB000')).toBeTruthy()
  })

  it('renders light palette color inputs', () => {
    render(<ThemeSettings theme={theme} onChange={() => {}} />)
    expect(screen.getByText('// LIGHT PALETTE')).toBeTruthy()
    expect(screen.getByDisplayValue('#F0F0F0')).toBeTruthy()
  })

  it('calls onChange when a color hex is edited', () => {
    const onChange = vi.fn()
    render(<ThemeSettings theme={theme} onChange={onChange} />)
    fireEvent.input(screen.getByDisplayValue('#0A0A0A'), {
      target: { value: '#111111' },
    })
    expect(onChange).toHaveBeenCalledOnce()
    expect(onChange.mock.calls[0][0].dark.backgroundColor).toBe('#111111')
  })

  it('does not call onChange for invalid hex', () => {
    const onChange = vi.fn()
    render(<ThemeSettings theme={theme} onChange={onChange} />)
    fireEvent.input(screen.getByDisplayValue('#0A0A0A'), {
      target: { value: '#ZZZ' },
    })
    expect(onChange).not.toHaveBeenCalled()
  })
})
