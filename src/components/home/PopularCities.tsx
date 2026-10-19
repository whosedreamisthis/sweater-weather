import { Link } from 'react-router'
import { cityPath } from '../../utils/routes'
import { LocationWeather } from '../favorites/LocationWeather'
import styles from './PopularCities.module.css'

const POPULAR_CITIES = [
  { name: 'Tokyo', country: 'Japan', latitude: 35.68, longitude: 139.69 },
  { name: 'London', country: 'United Kingdom', latitude: 51.51, longitude: -0.13 },
  { name: 'New York', country: 'United States', latitude: 40.71, longitude: -74.01 },
  { name: 'Sydney', country: 'Australia', latitude: -33.87, longitude: 151.21 },
  { name: 'Reykjavík', country: 'Iceland', latitude: 64.15, longitude: -21.94 },
  { name: 'Cairo', country: 'Egypt', latitude: 30.04, longitude: 31.24 },
]

export function PopularCities() {
  return (
    <section className={styles.section} aria-labelledby="popular-heading">
      <h2 id="popular-heading" className={styles.heading}>
        Popular cities
      </h2>
      <ul className={styles.grid}>
        {POPULAR_CITIES.map((city) => {
          const href = cityPath(city.latitude, city.longitude, city.name)
          return (
            <li key={city.name} className={styles.card}>
              <Link to={href} className={styles.link}>
                <span className={styles.name}>{city.name}</span>
                <span className={styles.country}>{city.country}</span>
              </Link>
              <LocationWeather location={city} />
            </li>
          )
        })}
      </ul>
    </section>
  )
}
