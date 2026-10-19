import type { CurrentWeather as CurrentWeatherData, Units } from '../../api/types'
import { compassDirection, formatUpdated, formatVisibility } from '../../utils/format'
import { describeWeatherCode } from '../../utils/weatherCodes'
import styles from './CurrentWeather.module.css'

type Props = {
  name: string
  current: CurrentWeatherData
  units: Units
  updatedMinutes: number
  isRefetching: boolean
}

const WIND_LABEL: Record<Units['wind'], string> = { kmh: 'km/h', mph: 'mph' }

function degrees(value: number, units: Units): string {
  return `${Math.round(value)}°${units.temperature === 'celsius' ? 'C' : 'F'}`
}

export function CurrentWeather({ name, current, units, updatedMinutes, isRefetching }: Props) {
  const condition = describeWeatherCode(current.weatherCode, current.isDay)
  const stats: Array<[string, string]> = [
    ['Humidity', `${Math.round(current.humidity)}%`],
    [
      'Wind',
      `${Math.round(current.windSpeed)} ${WIND_LABEL[units.wind]} ${compassDirection(current.windDirection)}`,
    ],
    ['Pressure', `${Math.round(current.pressure)} hPa`],
    ['UV index', String(Math.round(current.uvIndex * 10) / 10)],
    ['Visibility', formatVisibility(current.visibility)],
  ]

  return (
    <section
      className={styles.card}
      data-time={current.isDay ? 'day' : 'night'}
      data-group={condition.group}
      aria-labelledby="current-heading"
    >
      <header className={styles.top}>
        <h1 id="current-heading" className={styles.name}>
          {name}
        </h1>
        <p className={styles.updated}>
          {formatUpdated(updatedMinutes)}
          {isRefetching && <span className={styles.refreshing}> · Refreshing…</span>}
        </p>
      </header>

      <div className={styles.main}>
        <span className={styles.icon} role="img" aria-label={condition.description}>
          {condition.icon}
        </span>
        <div>
          <p className={styles.temp}>{degrees(current.temperature, units)}</p>
          <p className={styles.description}>{condition.description}</p>
          <p className={styles.feels}>Feels like {degrees(current.apparentTemperature, units)}</p>
        </div>
      </div>

      <dl className={styles.stats}>
        {stats.map(([label, value]) => (
          <div key={label} className={styles.stat}>
            <dt>{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}
