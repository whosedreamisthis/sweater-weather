import styles from './HowItWorks.module.css'

const STEPS = [
  { icon: '🔍', title: 'Search', text: 'Find any city, or use your location.' },
  { icon: '🌦️', title: 'Check', text: 'See current conditions, hourly and 7-day forecasts.' },
  { icon: '🧥', title: 'Dress', text: 'Get an outfit suggestion for the day ahead.' },
]

export function HowItWorks() {
  return (
    <section className={styles.section} aria-labelledby="how-heading">
      <h2 id="how-heading" className={styles.heading}>
        How it works
      </h2>
      <ol className={styles.steps}>
        {STEPS.map((step) => (
          <li key={step.title} className={styles.step}>
            <span className={styles.icon} aria-hidden="true">
              {step.icon}
            </span>
            <strong>{step.title}</strong>
            <span className={styles.text}>{step.text}</span>
          </li>
        ))}
      </ol>
    </section>
  )
}
