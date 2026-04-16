import type { NaviFeed } from '../../types/config'
import shared from './settings.module.css'

interface Props {
  feed: NaviFeed
  feedCollapsed: boolean
  onFeedChange: (feed: NaviFeed) => void
  onFeedCollapsedChange: (collapsed: boolean) => void
}

export function FeedSettings({ feed, feedCollapsed, onFeedChange, onFeedCollapsedChange }: Props) {
  return (
    <div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-color)', fontSize: '12px', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={feed.enabled}
            onChange={(e) => onFeedChange({ ...feed, enabled: (e.target as HTMLInputElement).checked })}
          />
          enabled
        </label>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ color: 'var(--text-color)', opacity: 0.4, fontSize: '11px', width: '120px', flexShrink: 0 }}>url</span>
          <input
            class={shared.input}
            type="text"
            value={feed.url}
            placeholder="https://feed.home.lab"
            disabled={!feed.enabled}
            onInput={(e) => onFeedChange({ ...feed, url: (e.target as HTMLInputElement).value })}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ color: 'var(--text-color)', opacity: 0.4, fontSize: '11px', width: '120px', flexShrink: 0 }}>token</span>
          <input
            class={shared.input}
            type="password"
            value={feed.token}
            placeholder="root token"
            disabled={!feed.enabled}
            onInput={(e) => onFeedChange({ ...feed, token: (e.target as HTMLInputElement).value })}
          />
        </div>

        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-color)', fontSize: '12px', cursor: 'pointer', opacity: feed.enabled ? 1 : 0.4 }}>
          <input
            type="checkbox"
            checked={feedCollapsed}
            disabled={!feed.enabled}
            onChange={(e) => onFeedCollapsedChange((e.target as HTMLInputElement).checked)}
          />
          collapsed by default
        </label>
      </div>
    </div>
  )
}
