import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/preact'
import { SettingsModal } from '../components/settings/SettingsModal'
import { DEFAULT_CONFIG } from '../config/defaults'

describe('SettingsModal', () => {
  it('renders header with title and close button', () => {
    render(<SettingsModal config={DEFAULT_CONFIG} onSave={() => {}} onClose={() => {}} />)
    expect(screen.getByText('[ SETTINGS ]')).toBeTruthy()
    expect(screen.getByText('[ ESC ]')).toBeTruthy()
  })

  it('renders Apply and Cancel buttons', () => {
    render(<SettingsModal config={DEFAULT_CONFIG} onSave={() => {}} onClose={() => {}} />)
    expect(screen.getByText('[ APPLY ]')).toBeTruthy()
    expect(screen.getByText('[ CANCEL ]')).toBeTruthy()
  })

  it('calls onClose when Cancel is clicked', () => {
    const onClose = vi.fn()
    render(<SettingsModal config={DEFAULT_CONFIG} onSave={() => {}} onClose={onClose} />)
    fireEvent.click(screen.getByText('[ CANCEL ]'))
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('calls onClose when ESC header button is clicked', () => {
    const onClose = vi.fn()
    render(<SettingsModal config={DEFAULT_CONFIG} onSave={() => {}} onClose={onClose} />)
    fireEvent.click(screen.getByText('[ ESC ]'))
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('calls onSave with config when Apply is clicked', () => {
    const onSave = vi.fn()
    render(<SettingsModal config={DEFAULT_CONFIG} onSave={onSave} onClose={() => {}} />)
    fireEvent.click(screen.getByText('[ APPLY ]'))
    expect(onSave).toHaveBeenCalledOnce()
    expect(onSave.mock.calls[0][0]).toEqual(DEFAULT_CONFIG)
  })

  it('renders section labels', () => {
    render(<SettingsModal config={DEFAULT_CONFIG} onSave={() => {}} onClose={() => {}} />)
    expect(screen.getByText('[ CATEGORIES ]')).toBeTruthy()
    expect(screen.getByText('[ SEARCH ]')).toBeTruthy()
    expect(screen.getByText('[ THEME ]')).toBeTruthy()
  })
})
