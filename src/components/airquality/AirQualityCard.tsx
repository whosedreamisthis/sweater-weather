import { useAirQuality } from '../../hooks/useAirQuality'
import { getAqiCategory } from '../../utils/airQuality'
import styles from './AirQualityCard.module.css'

type Props = {
  lat: number
  lon: number
}

// Shape and text carry the level too, so the colour is never the only signal.
const LEVEL_MARKS = ['●', '◆', '▲', '▲▲', '⬢', '⬢⬢'] as const

function formatMicrograms(value: number | null): string {
  return value === null ? '—' : `${Math.round(value * 10) / 10} µg/m³`
}

export function AirQualityCard({ lat, lon }: Props) {
  const { data, isPending, isError, refetch } = useAirQuality(lat, lon)

  if (isPending) {
    return (
      <section className={styles.card} aria-busy="true" aria-label="Loading air quality">
        <div className={`${styles.skeleton} ${styles.skelHeading}`} />
        <div className={`${styles.skeleton} ${styles.skelValue}`} />
        <div className={`${styles.skeleton} ${styles.skelLine}`} />
      </section>
    )
  }

  if (isError) {
    return (
      <section className={styles.card} aria-labelledby="air-quality-heading">
        <h2 id="air-quality-heading" className={styles.heading}>
          Air quality
        </h2>
        <p role="alert" className={styles.message}>
          Couldn't load air quality right now.
        </p>
        <button type="button" className={styles.retry} onClick={() => void refetch()}>
          Retry
        </button>
      </section>
    )
  }

  if (!data || data.usAqi === null) {
    return (
      <section className={styles.card} aria-labelledby="air-quality-heading">
        <h2 id="air-quality-heading" className={styles.heading}>
          Air quality
        </h2>
        <p className={styles.message}>Air quality isn't available for this location.</p>
      </section>
    )
  }

  const aqi = Math.round(data.usAqi)
  const category = getAqiCategory(aqi)
  return (
    <section
      className={styles.card}
      data-level={category.level}
      aria-labelledby="air-quality-heading"
    >
      <h2 id="air-quality-heading" className={styles.heading}>
        Air quality
      </h2>
      <div className={styles.main}>
        <span className={styles.badge} aria-hidden="true">
          {LEVEL_MARKS[category.level]}
        </span>
        <div>
          <p className={styles.value}>
            {aqi}
            <span className={styles.unit}> US AQI</span>
          </p>
          <p className={styles.category}>{category.label}</p>
        </div>
      </div>
      <p className={styles.note}>{category.note}</p>
      <dl className={styles.particles}>
        <div>
          <dt>PM2.5</dt>
          <dd>{formatMicrograms(data.pm25)}</dd>
        </div>
        <div>
          <dt>PM10</dt>
          <dd>{formatMicrograms(data.pm10)}</dd>
        </div>
      </dl>
    </section>
  )
}
