import styles from './FavoriteButton.module.css'

/** Reserves the space of FavoriteButton while the forecast loads. */
export function FavoriteButtonSkeleton() {
  return (
    <div className={styles.wrap} aria-hidden="true">
      <span className={styles.skeleton}>☆ Save location</span>
    </div>
  )
}
