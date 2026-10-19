import { useAppStore } from '../../store/useAppStore'
import { FavoriteCard } from './FavoriteCard'
import styles from './FavoritesList.module.css'

export function FavoritesList() {
  const favorites = useAppStore((s) => s.favorites)

  return (
    <section className={styles.section} aria-labelledby="favorites-heading">
      <h2 id="favorites-heading" className={styles.heading}>
        Saved locations
      </h2>
      {favorites.length === 0 ? (
        <p className={styles.empty}>
          No saved locations yet. Search for a city and press &ldquo;Save location&rdquo; to keep it
          here.
        </p>
      ) : (
        <ul className={styles.list}>
          {favorites.map((location) => (
            <FavoriteCard key={`${location.latitude},${location.longitude}`} location={location} />
          ))}
        </ul>
      )}
    </section>
  )
}
