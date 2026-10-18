import type { Units } from '../api/types'
import { useAppStore } from '../store/useAppStore'
import styles from './Settings.module.css'

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

export function Settings() {
  return (
    <>
      <h1>Settings</h1>
      <UnitGroup legend="Temperature" name="temperature" options={TEMPERATURE} />
      <UnitGroup legend="Wind speed" name="wind" options={WIND} />
      <UnitGroup legend="Precipitation" name="precipitation" options={PRECIPITATION} />
    </>
  )
}
