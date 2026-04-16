import type { NaviCategory } from '../../types/config'
import { CategoryForm } from './CategoryForm'
import shared from './settings.module.css'

interface Props {
  categories: NaviCategory[]
  onChange: (categories: NaviCategory[]) => void
}

export function CategoriesEditor({ categories, onChange }: Props) {
  const updateCategory = (index: number, updated: NaviCategory) => {
    onChange(categories.map((c, i) => (i === index ? updated : c)))
  }

  const deleteCategory = (index: number) => {
    onChange(categories.filter((_, i) => i !== index))
  }

  const addCategory = () => {
    onChange([...categories, { id: crypto.randomUUID(), label: '', links: [] }])
  }

  return (
    <div>
      {categories.map((cat, i) => (
        <CategoryForm
          key={cat.id}
          category={cat}
          onChange={(updated) => updateCategory(i, updated)}
          onDelete={() => deleteCategory(i)}
        />
      ))}
      <button class={shared.btnSmall} onClick={addCategory}>+ add category</button>
    </div>
  )
}
