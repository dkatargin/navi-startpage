import { useState } from 'preact/hooks'
import type { FeedItem } from '../services/feed'
import styles from './FeedSection.module.css'

interface Props {
  items: FeedItem[]
  categories: string[]
  gridColumns: number
  defaultCollapsed: boolean
}

function relativeTime(dateStr: string): string {
  const now = Date.now()
  const date = new Date(dateStr).getTime()
  const diff = now - date

  const minutes = Math.floor(diff / 60000)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

function FeedCategory({ category, items }: { category: string; items: FeedItem[] }) {
  return (
    <div data-feed-category={category}>
      <div class={styles.categoryLabel}>[ {category} ]</div>
      {items.map((item) => (
        <div key={item.url} class={styles.item}>
          <a class={styles.itemTitle} href={item.url} target="_blank" rel="noopener">
            {item.title}
          </a>
          <div class={styles.itemMeta}>
            <span class={styles.source}>{item.source_name || item.source}</span>
            <span class={styles.date}>{relativeTime(item.date)}</span>
          </div>
        </div>
      ))}
    </div>
  )
}

export function FeedSection({ items, categories, gridColumns, defaultCollapsed }: Props) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed)

  const groupedItems = new Map<string, FeedItem[]>()
  for (const cat of categories) {
    groupedItems.set(cat, [])
  }
  for (const item of items) {
    const list = groupedItems.get(item.category)
    if (list) list.push(item)
  }

  return (
    <>
      <hr class={styles.separator} />
      <div class={styles.header}>
        <span class={styles.toggle} onClick={() => setCollapsed(!collapsed)}>
          [{collapsed ? '▸' : '▾'} FEEDS ]
        </span>
      </div>
      {!collapsed && (
        <div class={styles.grid} style={{ gridTemplateColumns: `repeat(${gridColumns}, 1fr)` }}>
          {categories.map((cat) => (
            <FeedCategory key={cat} category={cat} items={groupedItems.get(cat) ?? []} />
          ))}
        </div>
      )}
    </>
  )
}
