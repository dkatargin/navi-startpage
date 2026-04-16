import type { NaviCategory, NaviLink } from '../../types/config'
import { LinkForm, LinkHeader } from './LinkForm'
import shared from './settings.module.css'

interface Props {
  category: NaviCategory
  onChange: (category: NaviCategory) => void
  onDelete: () => void
}

export function CategoryForm({ category, onChange, onDelete }: Props) {
  const updateLink = (index: number, link: NaviLink) => {
    onChange({
      ...category,
      links: category.links.map((l, i) => (i === index ? link : l)),
    })
  }

  const deleteLink = (index: number) => {
    onChange({
      ...category,
      links: category.links.filter((_, i) => i !== index),
    })
  }

  const addLink = () => {
    onChange({
      ...category,
      links: [...category.links, { title: '', url: '' }],
    })
  }

  return (
    <div data-category-header style={{ border: '1px solid var(--border-color)', padding: '12px', marginBottom: '12px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
        <input
          class={shared.input}
          type="text"
          value={category.label}
          placeholder="CATEGORY_NAME"
          style={{ flex: 1 }}
          onInput={(e) => onChange({ ...category, label: (e.target as HTMLInputElement).value })}
        />
        <label style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-color)', opacity: 0.4, fontSize: '11px', cursor: 'pointer', whiteSpace: 'nowrap' }}>
          <input
            type="checkbox"
            checked={category.collapsed ?? false}
            onChange={(e) => onChange({ ...category, collapsed: (e.target as HTMLInputElement).checked })}
          />
          collapsed
        </label>
      </div>

      <LinkHeader />
      {category.links.map((link, i) => (
        <LinkForm
          key={i}
          link={link}
          onChange={(updated) => updateLink(i, updated)}
          onDelete={() => deleteLink(i)}
        />
      ))}
      <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
        <button class={shared.btnSmall} onClick={addLink}>+ add link</button>
        <button class={shared.btnDanger} data-delete-category onClick={onDelete}>×</button>
      </div>
    </div>
  )
}
