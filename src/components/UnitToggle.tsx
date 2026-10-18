import { useAppStore } from '../store/useAppStore'
import styles from './UnitToggle.module.css'

/** Quick °C/°F switch for the header; wind and precipitation live in Settings. */
export function UnitToggle() {
  const temperature = useAppStore((s) => s.units.temperature)
  const setUnits = useAppStore((s) => s.setUnits)
  const next = temperature === 'celsius' ? 'fahrenheit' : 'celsius'

  return (
    <button
      type="button"
      className={styles.toggle}
      onClick={() => setUnits({ temperature: next })}
      aria-label={`Switch to ${next === 'celsius' ? 'Celsius' : 'Fahrenheit'}`}
    >
      <span aria-hidden="true">{temperature === 'celsius' ? '°C' : '°F'}</span>
    </button>
  )
}
