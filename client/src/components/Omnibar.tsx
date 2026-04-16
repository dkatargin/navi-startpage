import { useState, useRef, useEffect, useCallback } from 'preact/hooks'
import type { RefObject } from 'preact'
import { searchBookmarks, searchHistory } from '../services/search'
import type { SearchResult } from '../services/search'
import styles from './Omnibar.module.css'

interface Props {
  fallbackUrl: string
  inputRef?: RefObject<HTMLInputElement>
}

export function Omnibar({ fallbackUrl, inputRef: externalRef }: Props) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [activeIndex, setActiveIndex] = useState(-1)
  const [isOpen, setIsOpen] = useState(false)
  const internalRef = useRef<HTMLInputElement>(null)
  const inputRef = externalRef ?? internalRef
  const debounceRef = useRef<ReturnType<typeof setTimeout>>()

  const bookmarkResults = results.filter((r) => r.source === 'bookmark')
  const historyResults = results.filter((r) => r.source === 'history')
  const totalItems = results.length + (isOpen ? 1 : 0) // +1 for Kagi

  const performSearch = useCallback(async (q: string) => {
    if (q.length < 2) {
      setResults([])
      setIsOpen(false)
      return
    }

    const [bookmarks, history] = await Promise.all([
      searchBookmarks(q),
      searchHistory(q),
    ])

    setResults([...bookmarks, ...history])
    setIsOpen(true)
    setActiveIndex(-1)
  }, [])

  const handleInput = (e: Event) => {
    const value = (e.target as HTMLInputElement).value
    setQuery(value)

    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => performSearch(value), 150)
  }

  const navigate = (url: string) => {
    window.location.href = url
  }

  const getFallbackHref = () =>
    fallbackUrl.replace('%s', encodeURIComponent(query))

  const handleKeyDown = (e: KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        if (!isOpen) return
        e.preventDefault()
        setActiveIndex((i) => Math.min(i + 1, totalItems - 1))
        break
      case 'ArrowUp':
        if (!isOpen) return
        e.preventDefault()
        setActiveIndex((i) => Math.max(i - 1, -1))
        break
      case 'Enter':
        e.preventDefault()
        if (activeIndex >= 0 && activeIndex < results.length) {
          navigate(results[activeIndex].url)
        } else if (activeIndex === results.length || query.length >= 2) {
          navigate(getFallbackHref())
        }
        break
      case 'Escape':
        setQuery('')
        setResults([])
        setIsOpen(false)
        setActiveIndex(-1)
        break
    }
  }

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  let flatIndex = 0

  return (
    <div class={styles.wrapper}>
      <input
        ref={inputRef}
        class={styles.input}
        type="text"
        value={query}
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        placeholder="> search_"
      />
      {isOpen && (
        <div class={styles.dropdown}>
          {bookmarkResults.length > 0 && (
            <>
              <div class={styles.sectionLabel}>[ BOOKMARKS ]</div>
              {bookmarkResults.map((r) => {
                const idx = flatIndex++
                return (
                  <a
                    key={r.url}
                    href={r.url}
                    class={`${styles.item} ${idx === activeIndex ? styles.itemActive : ''}`}
                    data-index={idx}
                    data-active={idx === activeIndex ? 'true' : 'false'}
                    onClick={(e) => {
                      e.preventDefault()
                      navigate(r.url)
                    }}
                  >
                    <span class={styles.itemTitle}>{r.title}</span>
                    <span class={styles.itemUrl}>{r.url}</span>
                  </a>
                )
              })}
            </>
          )}
          {historyResults.length > 0 && (
            <>
              <div class={styles.sectionLabel}>[ HISTORY ]</div>
              {historyResults.map((r) => {
                const idx = flatIndex++
                return (
                  <a
                    key={r.url}
                    href={r.url}
                    class={`${styles.item} ${idx === activeIndex ? styles.itemActive : ''}`}
                    data-index={idx}
                    data-active={idx === activeIndex ? 'true' : 'false'}
                    onClick={(e) => {
                      e.preventDefault()
                      navigate(r.url)
                    }}
                  >
                    <span class={styles.itemTitle}>{r.title}</span>
                    <span class={styles.itemUrl}>{r.url}</span>
                  </a>
                )
              })}
            </>
          )}
          <div class={styles.sectionLabel}>[ KAGI ]</div>
          <a
            href={getFallbackHref()}
            class={`${styles.item} ${activeIndex === results.length ? styles.itemActive : ''}`}
            data-index={flatIndex}
            data-active={activeIndex === results.length ? 'true' : 'false'}
            onClick={(e) => {
              e.preventDefault()
              navigate(getFallbackHref())
            }}
          >
            <span class={styles.itemTitle}>Search "{query}" in Kagi</span>
          </a>
        </div>
      )}
    </div>
  )
}
