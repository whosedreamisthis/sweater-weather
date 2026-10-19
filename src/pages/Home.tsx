import { FavoritesList } from '../components/favorites/FavoritesList'
import { HowItWorks } from '../components/home/HowItWorks'
import { PopularCities } from '../components/home/PopularCities'
import { SearchBox } from '../components/SearchBox'
import styles from './Home.module.css'

export function Home() {
  return (
    <>
      <h1 className={styles.title}>Know what to wear before you step outside.</h1>
      <p className={styles.tagline}>
        Search for a city to see the weather, plus an outfit suggestion for the day.
      </p>
      <div className={styles.search}>
        <SearchBox />
      </div>
      <FavoritesList />
      <PopularCities />
      <HowItWorks />
    </>
  )
}
