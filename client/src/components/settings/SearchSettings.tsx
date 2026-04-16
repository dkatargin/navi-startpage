import shared from './settings.module.css'

interface Props {
  fallbackUrl: string
  onChange: (url: string) => void
}

export function SearchSettings({ fallbackUrl, onChange }: Props) {
  const hasPlaceholder = fallbackUrl.includes('%s')

  return (
    <div>
      <input
        class={shared.input}
        type="text"
        value={fallbackUrl}
        placeholder="https://example.com/search?q=%s"
        onInput={(e) => onChange((e.target as HTMLInputElement).value)}
      />
      {hasPlaceholder ? (
        <div class={shared.hint}>Use %s as query placeholder</div>
      ) : (
        <div class={shared.hint} style={{ color: 'var(--error-color)' }}>
          ⚠ Missing %s placeholder — search will not insert your query
        </div>
      )}
    </div>
  )
}
