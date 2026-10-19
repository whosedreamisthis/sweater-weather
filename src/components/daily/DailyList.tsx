import { useState } from 'react'
import type { DailyPoint, Units } from '../../api/types'
import { formatClock, formatWeekday } from '../../utils/daily'
import { describeWeatherCode } from '../../utils/weatherCodes'
import styles from './DailyList.module.css'

type Props = {
  days: DailyPoint[]
  units: Units
}

export function DailyList({ days, units }: Props) {
  const [openDate, setOpenDate] = useState<string | null>(null)
  const unit = units.temperature === 'celsius' ? 'C' : 'F'

  return (
    <section className={styles.section} aria-labelledby="daily-heading">
      <h2 id="daily-heading" className={styles.heading}>
        7-day forecast
      </h2>
      <ul className={styles.list}>
        {days.map((day, i) => {
          const condition = describeWeatherCode(day.weatherCode)
          const chance = Math.round(day.precipitationProbabilitySum)
          const open = openDate === day.date
          const detailsId = `daily-details-${day.date}`
          return (
            <li key={day.date} className={styles.item}>
              <button
                type="button"
                className={styles.row}
                aria-expanded={open}
                aria-controls={detailsId}
                onClick={() => setOpenDate(open ? null : day.date)}
              >
                <span className={styles.day}>{formatWeekday(day.date, i === 0)}</span>
                <span className={styles.icon} role="img" aria-label={condition.description}>
                  {condition.icon}
                </span>
                <span className={styles.condition}>{condition.description}</span>
                <span className={styles.rain}>
                  <span aria-hidden="true">{chance}%</span>
                  <span className={styles.visuallyHidden}>{chance}% chance of precipitation</span>
                </span>
                <span className={styles.low}>
                  {Math.round(day.tempMin)}°{unit}
                </span>
                <span className={styles.dash} aria-hidden="true">
                  –
                </span>
                <span className={styles.high}>
                  {Math.round(day.tempMax)}°{unit}
                </span>
              </button>
              <dl id={detailsId} className={styles.details} hidden={!open}>
                <div>
                  <dt>Sunrise</dt>
                  <dd>{formatClock(day.sunrise)}</dd>
                </div>
                <div>
                  <dt>Sunset</dt>
                  <dd>{formatClock(day.sunset)}</dd>
                </div>
                <div>
                  <dt>Max UV index</dt>
                  <dd>{Math.round(day.uvIndexMax)}</dd>
                </div>
              </dl>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
