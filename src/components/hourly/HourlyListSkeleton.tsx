import styles from './HourlyList.module.css'

export function HourlyListSkeleton() {
  return (
    <section className={styles.section} aria-busy="true" aria-label="Loading hourly forecast">
      <div className={styles.list}>
        {Array.from({ length: 8 }, (_, i) => (
          <div key={i} className={`${styles.item} ${styles.skeleton}`} />
        ))}
      </div>
    </section>
  )
}
