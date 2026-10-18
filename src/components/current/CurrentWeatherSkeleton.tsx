import styles from './CurrentWeather.module.css'

export function CurrentWeatherSkeleton() {
  return (
    <section className={styles.card} aria-busy="true" aria-label="Loading current weather">
      <div className={`${styles.skeleton} ${styles.skelName}`} />
      <div className={styles.main}>
        <div className={`${styles.skeleton} ${styles.skelIcon}`} />
        <div className={styles.skelText}>
          <div className={`${styles.skeleton} ${styles.skelTemp}`} />
          <div className={`${styles.skeleton} ${styles.skelLine}`} />
        </div>
      </div>
      <div className={styles.stats}>
        {Array.from({ length: 5 }, (_, i) => (
          <div key={i} className={`${styles.skeleton} ${styles.skelStat}`} />
        ))}
      </div>
    </section>
  )
}
