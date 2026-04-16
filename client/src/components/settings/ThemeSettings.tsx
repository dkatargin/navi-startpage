import { useState, useEffect } from 'preact/hooks'
import type { NaviTheme, ThemePalette } from '../../types/config'
import shared from './settings.module.css'
import styles from './ThemeSettings.module.css'

interface Props {
  theme: NaviTheme
  onChange: (theme: NaviTheme) => void
}

const PALETTE_KEYS: { key: keyof ThemePalette; label: string }[] = [
  { key: 'backgroundColor', label: 'background' },
  { key: 'textColor', label: 'text' },
  { key: 'accentColor', label: 'accent' },
  { key: 'accentSecondary', label: 'accentSecondary' },
  { key: 'borderColor', label: 'border' },
]

const isValidHex = (v: string) => /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(v)

function ColorRow({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (hex: string) => void
}) {
  const [text, setText] = useState(value)

  useEffect(() => {
    setText(value)
  }, [value])

  const handleTextInput = (e: Event) => {
    const hex = (e.target as HTMLInputElement).value
    setText(hex)
    if (isValidHex(hex)) {
      onChange(hex)
    }
  }

  const handlePickerInput = (e: Event) => {
    const hex = (e.target as HTMLInputElement).value
    setText(hex)
    onChange(hex)
  }

  return (
    <div class={styles.colorRow}>
      <span class={styles.colorName}>{label}</span>
      <input
        class={styles.colorPicker}
        type="color"
        value={isValidHex(text) ? text : value}
        onInput={handlePickerInput}
      />
      <input
        class={`${shared.input} ${styles.colorHex} ${!isValidHex(text) ? shared.inputError : ''}`}
        type="text"
        value={text}
        onInput={handleTextInput}
      />
    </div>
  )
}

function PaletteEditor({
  label,
  palette,
  onChange,
}: {
  label: string
  palette: ThemePalette
  onChange: (palette: ThemePalette) => void
}) {
  return (
    <div class={styles.paletteGroup}>
      <div class={styles.paletteLabel}>{label}</div>
      {PALETTE_KEYS.map(({ key, label: rowLabel }) => (
        <ColorRow
          key={key}
          label={rowLabel}
          value={palette[key]}
          onChange={(hex) => onChange({ ...palette, [key]: hex })}
        />
      ))}
    </div>
  )
}

export function ThemeSettings({ theme, onChange }: Props) {
  const modes: NaviTheme['mode'][] = ['dark', 'light', 'system']

  return (
    <div>
      <div class={styles.modeSelector}>
        {modes.map((m) => (
          <button
            key={m}
            class={`${styles.modeBtn} ${theme.mode === m ? styles.modeBtnActive : ''}`}
            onClick={() => onChange({ ...theme, mode: m })}
          >
            {m.toUpperCase()}
          </button>
        ))}
      </div>

      <div class={styles.fontSettings}>
        <div class={styles.fontRow}>
          <span class={styles.colorName}>font-family</span>
          <input
            class={`${shared.input} ${styles.fontInput}`}
            type="text"
            value={theme.fontFamily}
            onInput={(e) => onChange({ ...theme, fontFamily: (e.target as HTMLInputElement).value })}
          />
        </div>
        <div class={styles.fontRow}>
          <span class={styles.colorName}>font-size</span>
          <input
            class={`${shared.input} ${styles.fontSizeInput}`}
            type="number"
            min={10}
            max={24}
            value={theme.fontSize}
            onInput={(e) => {
              const v = parseInt((e.target as HTMLInputElement).value, 10)
              if (v >= 10 && v <= 24) onChange({ ...theme, fontSize: v })
            }}
          />
          <span class={styles.fontSizeUnit}>px</span>
        </div>
      </div>

      <hr class={styles.separator} />

      <PaletteEditor
        label="// DARK PALETTE"
        palette={theme.dark}
        onChange={(dark) => onChange({ ...theme, dark })}
      />

      <hr class={styles.separator} />

      <PaletteEditor
        label="// LIGHT PALETTE"
        palette={theme.light}
        onChange={(light) => onChange({ ...theme, light })}
      />
    </div>
  )
}
