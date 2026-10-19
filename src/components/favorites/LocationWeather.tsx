import type { Location } from '../../api/types'
import { useForecast } from '../../hooks/useForecast'
import { describeWeatherCode } from '../../utils/weatherCodes'
import styles from './LocationWeather.module.css'

type Props = {
  location: Pick<Location, 'name' | 'latitude' | 'longitude'>
}

/** Compact icon + temperature for a location, with its own loading and retry states. */
export function LocationWeather({ location }: Props) {
  const { name, latitude, longitude } = location
  const forecast = useForecast(latitude, longitude)

  if (forecast.isError) {
    return (
      <span className={styles.status}>
        Couldn&apos;t load.{' '}
        <button type="button" className={styles.retry} onClick={() => void forecast.refetch()}>
          Retry
        </button>
      </span>
    )
  }

  if (!forecast.data) {
    return (
      <span className={styles.status} role="status" aria-label={`Loading weather for ${name}`}>
        Loading…
      </span>
    )
  }

  const { current } = forecast.data
  const condition = describeWeatherCode(current.weatherCode, current.isDay)
  return (
    <span className={styles.weather}>
      <span role="img" aria-label={condition.description}>
        {condition.icon}
      </span>{' '}
      {Math.round(current.temperature)}°{forecast.units.temperature === 'celsius' ? 'C' : 'F'}
    </span>
  )
}
