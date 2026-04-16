import styles from './StatusBar.module.css'

interface Props {
  onSettingsClick: () => void
  feedStatus: 'local' | 'online' | 'offline'
  feedCount?: number
}

export function StatusBar({ onSettingsClick, feedStatus, feedCount }: Props) {
  let feedSegment: preact.JSX.Element
  switch (feedStatus) {
    case 'online':
      feedSegment = <span class={styles.segment}>[ FEED: {feedCount ?? 0} items ]</span>
      break
    case 'offline':
      feedSegment = <span class={`${styles.segment} ${styles.error}`}>[ FEED: OFFLINE ]</span>
      break
    default:
      feedSegment = <span class={styles.segment}>[ LOCAL MODE ]</span>
  }

  return (
    <div class={styles.bar}>
      <span class={styles.segment}>[ SYSTEM: ONLINE ]</span>
      <span class={styles.segment}>[ NAVI v0.2 ]</span>
      {feedSegment}
      <span class={styles.spacer} />
      <span class={styles.settingsBtn} onClick={onSettingsClick}>
        [ SETTINGS ]
      </span>
    </div>
  )
}
