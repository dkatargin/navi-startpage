import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/preact'
import { CategoriesEditor } from '../components/settings/CategoriesEditor'
import type { NaviCategory } from '../types/config'

const mockCategories: NaviCategory[] = [
  {
    id: 'dev',
    label: 'DEV',
    links: [
      { title: 'GitHub', url: 'https://github.com', icon: '🐙' },
      { title: 'GitLab', url: 'https://gitlab.com' },
    ],
  },
  {
    id: 'tools',
    label: 'TOOLS',
    links: [{ title: 'Kagi', url: 'https://kagi.com' }],
  },
]

describe('CategoriesEditor', () => {
  it('renders all category labels', () => {
    render(<CategoriesEditor categories={mockCategories} onChange={() => {}} />)
    expect(screen.getByDisplayValue('DEV')).toBeTruthy()
    expect(screen.getByDisplayValue('TOOLS')).toBeTruthy()
  })

  it('renders all link titles', () => {
    render(<CategoriesEditor categories={mockCategories} onChange={() => {}} />)
    expect(screen.getByDisplayValue('GitHub')).toBeTruthy()
    expect(screen.getByDisplayValue('GitLab')).toBeTruthy()
    expect(screen.getByDisplayValue('Kagi')).toBeTruthy()
  })

  it('calls onChange when category label is edited', () => {
    const onChange = vi.fn()
    render(<CategoriesEditor categories={mockCategories} onChange={onChange} />)
    fireEvent.input(screen.getByDisplayValue('DEV'), { target: { value: 'DEVELOPMENT' } })
    expect(onChange).toHaveBeenCalledOnce()
    const updated = onChange.mock.calls[0][0] as NaviCategory[]
    expect(updated[0].label).toBe('DEVELOPMENT')
    expect(updated[1].label).toBe('TOOLS')
  })

  it('calls onChange when link title is edited', () => {
    const onChange = vi.fn()
    render(<CategoriesEditor categories={mockCategories} onChange={onChange} />)
    fireEvent.input(screen.getByDisplayValue('GitHub'), { target: { value: 'GitHub.com' } })
    expect(onChange).toHaveBeenCalledOnce()
    const updated = onChange.mock.calls[0][0] as NaviCategory[]
    expect(updated[0].links[0].title).toBe('GitHub.com')
  })

  it('adds a new link when "+ add link" is clicked', () => {
    const onChange = vi.fn()
    render(<CategoriesEditor categories={mockCategories} onChange={onChange} />)
    const addButtons = screen.getAllByText('+ add link')
    fireEvent.click(addButtons[0])
    expect(onChange).toHaveBeenCalledOnce()
    const updated = onChange.mock.calls[0][0] as NaviCategory[]
    expect(updated[0].links).toHaveLength(3)
  })

  it('deletes a link when × is clicked', () => {
    const onChange = vi.fn()
    render(<CategoriesEditor categories={mockCategories} onChange={onChange} />)
    // × buttons: first two are link deletes for DEV category (GitHub, GitLab)
    const deleteButtons = screen.getAllByText('×')
    fireEvent.click(deleteButtons[0])
    expect(onChange).toHaveBeenCalledOnce()
    const updated = onChange.mock.calls[0][0] as NaviCategory[]
    expect(updated[0].links).toHaveLength(1)
    expect(updated[0].links[0].title).toBe('GitLab')
  })

  it('adds a new category when "+ add category" is clicked', () => {
    const onChange = vi.fn()
    render(<CategoriesEditor categories={mockCategories} onChange={onChange} />)
    fireEvent.click(screen.getByText('+ add category'))
    expect(onChange).toHaveBeenCalledOnce()
    const updated = onChange.mock.calls[0][0] as NaviCategory[]
    expect(updated).toHaveLength(3)
    expect(updated[2].label).toBe('')
    expect(updated[2].links).toEqual([])
  })

  it('deletes a category', () => {
    const onChange = vi.fn()
    render(<CategoriesEditor categories={mockCategories} onChange={onChange} />)
    const devInput = screen.getByDisplayValue('DEV')
    const categoryHeader = devInput.closest('[data-category-header]')!
    const deleteBtn = categoryHeader.querySelector('[data-delete-category]')! as HTMLElement
    fireEvent.click(deleteBtn)
    expect(onChange).toHaveBeenCalledOnce()
    const updated = onChange.mock.calls[0][0] as NaviCategory[]
    expect(updated).toHaveLength(1)
    expect(updated[0].label).toBe('TOOLS')
  })
})
