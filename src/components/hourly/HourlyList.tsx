import type { DailyPoint, HourlyPoint, Units } from '../../api/types'
import { formatHour, isDaytime } from '../../utils/hourly'
import { describeWeatherCode } from '../../utils/weatherCodes'
import styles from './HourlyList.module.css'

type Props = {
  hours: HourlyPoint[]
  daily: DailyPoint[]
  units: Units
}

export function HourlyList({ hours, daily, units }: Props) {
  return (
    <section className={styles.section} aria-labelledby="hourly-heading">
      <h2 id="hourly-heading" className={styles.heading}>
        Next 24 hours
      </h2>
      {/* Focusable so keyboard users can scroll the strip with the arrow keys. */}
      <ul className={styles.list} tabIndex={0} aria-labelledby="hourly-heading">
        {hours.map((hour, i) => {
          const condition = describeWeatherCode(hour.weatherCode, isDaytime(hour.time, daily))
          const chance = Math.round(hour.precipitationProbability)
          return (
            <li key={hour.time} className={styles.item} data-now={i === 0 || undefined}>
              <span className={styles.time}>{i === 0 ? 'Now' : formatHour(hour.time)}</span>
              <span className={styles.icon} role="img" aria-label={condition.description}>
                {condition.icon}
              </span>
              <span className={styles.temp}>
                {Math.round(hour.temperature)}°{units.temperature === 'celsius' ? 'C' : 'F'}
              </span>
              <span className={styles.rain}>
                <span aria-hidden="true">{chance}%</span>
                <span className={styles.visuallyHidden}>{chance}% chance of precipitation</span>
              </span>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
