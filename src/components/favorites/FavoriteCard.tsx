import { Link } from 'react-router'
import type { Location } from '../../api/types'
import { useForecast } from '../../hooks/useForecast'
import { useAppStore } from '../../store/useAppStore'
import { describeWeatherCode } from '../../utils/weatherCodes'
import styles from './FavoriteCard.module.css'

type Props = {
  location: Location
}

export function FavoriteCard({ location }: Props) {
  const removeFavorite = useAppStore((s) => s.removeFavorite)
  const forecast = useForecast(location.latitude, location.longitude)
  const { latitude, longitude, name } = location
  const href = `/city/${latitude}/${longitude}?name=${encodeURIComponent(name)}`

  let body
  if (forecast.isError) {
    body = (
      <span className={styles.status}>
        Couldn&apos;t load.{' '}
        <button type="button" className={styles.retry} onClick={() => void forecast.refetch()}>
          Retry
        </button>
      </span>
    )
  } else if (!forecast.data) {
    body = (
      <span className={styles.status} role="status" aria-label={`Loading weather for ${name}`}>
        Loading…
      </span>
    )
  } else {
    const { current } = forecast.data
    const condition = describeWeatherCode(current.weatherCode, current.isDay)
    body = (
      <span className={styles.weather}>
        <span role="img" aria-label={condition.description}>
          {condition.icon}
        </span>{' '}
        {Math.round(current.temperature)}°{forecast.units.temperature === 'celsius' ? 'C' : 'F'}
      </span>
    )
  }

  return (
    <li className={styles.card}>
      <Link to={href} className={styles.link}>
        <span className={styles.name}>{name}</span>
        {location.country && <span className={styles.country}>{location.country}</span>}
      </Link>
      {body}
      <button
        type="button"
        className={styles.remove}
        aria-label={`Remove ${name}`}
        onClick={() => removeFavorite(latitude, longitude)}
      >
        ✕
      </button>
    </li>
  )
}
