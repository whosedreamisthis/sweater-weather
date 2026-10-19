import { Link } from 'react-router'
import type { Location } from '../../api/types'
import { useAppStore } from '../../store/useAppStore'
import { cityPath } from '../../utils/routes'
import styles from './FavoriteCard.module.css'
import { LocationWeather } from './LocationWeather'

type Props = {
  location: Location
}

export function FavoriteCard({ location }: Props) {
  const removeFavorite = useAppStore((s) => s.removeFavorite)
  const { latitude, longitude, name } = location
  const href = cityPath(latitude, longitude, name)

  return (
    <li className={styles.card}>
      <Link to={href} className={styles.link}>
        <span className={styles.name}>{name}</span>
        {location.country && <span className={styles.country}>{location.country}</span>}
      </Link>
      <LocationWeather location={location} />
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
