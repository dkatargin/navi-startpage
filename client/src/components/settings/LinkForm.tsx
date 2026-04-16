import type { NaviLink } from '../../types/config'
import shared from './settings.module.css'
import styles from './LinkForm.module.css'

interface Props {
  link: NaviLink
  onChange: (link: NaviLink) => void
  onDelete: () => void
}

function isValidUrl(url: string): boolean {
  return url.trim() === '' || /^(https?:\/\/|\/\/)/.test(url)
}

export function LinkForm({ link, onChange, onDelete }: Props) {
  return (
    <div class={styles.row}>
      <input
        class={shared.input}
        type="text"
        value={link.title}
        placeholder="title"
        onInput={(e) => onChange({ ...link, title: (e.target as HTMLInputElement).value })}
      />
      <input
        class={`${shared.input} ${!isValidUrl(link.url) ? shared.inputError : ''}`}
        type="text"
        value={link.url}
        placeholder="https://..."
        onInput={(e) => onChange({ ...link, url: (e.target as HTMLInputElement).value })}
      />
      <input
        class={shared.input}
        type="text"
        value={link.icon ?? ''}
        placeholder="icon"
        onInput={(e) => onChange({ ...link, icon: (e.target as HTMLInputElement).value || undefined })}
      />
      <button class={shared.btnDanger} onClick={onDelete}>×</button>
    </div>
  )
}

export function LinkHeader() {
  return (
    <div class={styles.header}>
      <span>title</span>
      <span>url</span>
      <span>icon</span>
      <span></span>
    </div>
  )
}
