import { FavoritesList } from '../components/favorites/FavoritesList'
import { SearchBox } from '../components/SearchBox'
import styles from './Home.module.css'

export function Home() {
  return (
    <>
      <h1>Home</h1>
      <p>Search for a city to see the weather.</p>
      <div className={styles.search}>
        <SearchBox />
      </div>
      <FavoritesList />
    </>
  )
}
