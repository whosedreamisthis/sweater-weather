import { useEffect, useId, useRef } from 'react'
import type { KeyboardEvent } from 'react'
import type { Units } from '../api/types'
import { useAppStore } from '../store/useAppStore'
import { THEMES } from '../utils/theme'
import type { Theme } from '../utils/theme'
import styles from './SettingsModal.module.css'

type Option<K extends keyof Units> = { value: Units[K]; label: string }

const TEMPERATURE: Option<'temperature'>[] = [
  { value: 'celsius', label: '°C' },
  { value: 'fahrenheit', label: '°F' },
]
const WIND: Option<'wind'>[] = [
  { value: 'kmh', label: 'km/h' },
  { value: 'mph', label: 'mph' },
]
const PRECIPITATION: Option<'precipitation'>[] = [
  { value: 'mm', label: 'mm' },
  { value: 'inch', label: 'in' },
]

function UnitGroup<K extends keyof Units>({
  legend,
  name,
  options,
}: {
  legend: string
  name: K
  options: Option<K>[]
}) {
  const current = useAppStore((s) => s.units[name])
  const setUnits = useAppStore((s) => s.setUnits)

  return (
    <fieldset className={styles.group}>
      <legend className={styles.legend}>{legend}</legend>
      <div className={styles.segments}>
        {options.map((option) => (
          <label key={option.value} className={styles.segment}>
            <input
              type="radio"
              className={styles.input}
              name={name}
              value={option.value}
              checked={current === option.value}
              onChange={() => setUnits({ [name]: option.value })}
            />
            {option.label}
          </label>
        ))}
      </div>
    </fieldset>
  )
}

const THEME_LABELS: Record<Theme, string> = { light: 'Light', dark: 'Dark', system: 'System' }

function ThemeGroup() {
  const theme = useAppStore((s) => s.theme)
  const setTheme = useAppStore((s) => s.setTheme)

  return (
    <fieldset className={styles.group}>
      <legend className={styles.legend}>Theme</legend>
      <div className={styles.segments}>
        {THEMES.map((value) => (
          <label key={value} className={styles.segment}>
            <input
              type="radio"
              className={styles.input}
              name="theme"
              value={value}
              checked={theme === value}
              onChange={() => setTheme(value)}
            />
            {THEME_LABELS[value]}
          </label>
        ))}
      </div>
    </fieldset>
  )
}

type Props = { onClose: () => void }

const FOCUSABLE = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ')

export function SettingsModal({ onClose }: Props) {
  const dialogRef = useRef<HTMLDivElement>(null)
  const titleId = useId()
  const unitsId = useId()
  const appearanceId = useId()

  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null
    dialogRef.current?.querySelector<HTMLElement>(FOCUSABLE)?.focus()
    return () => previouslyFocused?.focus()
  }, [])

  function onKeyDown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      onClose()
      return
    }
    if (event.key !== 'Tab') return
    // Keep Tab inside the dialog.
    const items = [...(dialogRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? [])]
    if (items.length === 0) return
    const first = items[0]
    const last = items[items.length - 1]
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault()
      last.focus()
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault()
      first.focus()
    }
  }

  return (
    <div
      className={styles.backdrop}
      onMouseDown={(event) => event.target === event.currentTarget && onClose()}
    >
      <div
        ref={dialogRef}
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onKeyDown={onKeyDown}
      >
        <div className={styles.head}>
          <h2 id={titleId} className={styles.title}>
            Settings
          </h2>
          <button type="button" className={styles.close} onClick={onClose} aria-label="Close settings">
            ×
          </button>
        </div>
        <section className={styles.section} aria-labelledby={unitsId}>
          <h3 id={unitsId} className={styles.sectionTitle}>
            Units
          </h3>
          <UnitGroup legend="Temperature" name="temperature" options={TEMPERATURE} />
          <UnitGroup legend="Wind speed" name="wind" options={WIND} />
          <UnitGroup legend="Precipitation" name="precipitation" options={PRECIPITATION} />
        </section>
        <section className={styles.section} aria-labelledby={appearanceId}>
          <h3 id={appearanceId} className={styles.sectionTitle}>
            Appearance
          </h3>
          <ThemeGroup />
        </section>
      </div>
    </div>
  )
}
