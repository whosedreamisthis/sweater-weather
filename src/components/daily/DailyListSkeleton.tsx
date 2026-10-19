import styles from './DailyList.module.css'

export function DailyListSkeleton() {
  return (
    <section className={styles.section} aria-busy="true" aria-label="Loading daily forecast">
      <ul className={styles.list}>
        {Array.from({ length: 7 }, (_, i) => (
          <li key={i} className={`${styles.item} ${styles.skeleton}`} />
        ))}
      </ul>
    </section>
  )
}
