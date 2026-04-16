import { useState } from 'preact/hooks'
import type { NaviCategory } from '../types/config'
import styles from './BookmarksGrid.module.css'

const VISIBLE_LINKS = 5

interface Props {
  categories: NaviCategory[]
  gridColumns?: number
}

function LinkIcon({ icon, title }: { icon?: string; title: string }) {
  if (!icon) return null

  if (icon.startsWith('http') || icon.startsWith('//')) {
    return (
      <img
        class={styles.iconImg}
        src={icon}
        alt={title}
        width={16}
        height={16}
        onError={(e) => {
          ;(e.target as HTMLImageElement).style.display = 'none'
        }}
      />
    )
  }

  return <span class={styles.iconEmoji}>{icon}</span>
}

function Category({ category }: { category: NaviCategory }) {
  const [collapsed, setCollapsed] = useState(category.collapsed ?? false)
  const [expanded, setExpanded] = useState(false)

  const hasMore = category.links.length > VISIBLE_LINKS
  const visibleLinks = expanded ? category.links : category.links.slice(0, VISIBLE_LINKS)
  const hiddenCount = category.links.length - VISIBLE_LINKS

  return (
    <div>
      <h2
        class={styles.label}
        onClick={() => setCollapsed(!collapsed)}
      >
        [{collapsed ? '▸' : '▾'} {category.label} ]
      </h2>
      {!collapsed && (
        <ul class={styles.links}>
          {visibleLinks.map((link) => (
            <li key={link.url} class={styles.linkItem}>
              <LinkIcon icon={link.icon} title={link.title} />
              <a href={link.url} class={styles.link}>
                {link.title}
              </a>
            </li>
          ))}
          {hasMore && !expanded && (
            <li
              class={styles.more}
              onClick={() => setExpanded(true)}
            >
              ... +{hiddenCount} more
            </li>
          )}
        </ul>
      )}
    </div>
  )
}

export function BookmarksGrid({ categories, gridColumns = 4 }: Props) {
  return (
    <div
      class={styles.grid}
      style={{ gridTemplateColumns: `repeat(${gridColumns}, 1fr)` }}
    >
      {categories.map((cat) => (
        <Category key={cat.id} category={cat} />
      ))}
    </div>
  )
}
