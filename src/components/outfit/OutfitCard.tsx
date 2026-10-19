import type { CurrentWeather, HourlyPoint, Units } from '../../api/types'
import { getOutfit, toCelsius, toKmh, worstRainChance } from '../../utils/outfit'
import styles from './OutfitCard.module.css'

type Props = {
  current: CurrentWeather
  /** Hours starting at the current hour. */
  hours: HourlyPoint[]
  units: Units
}

export function OutfitCard({ current, hours, units }: Props) {
  const outfit = getOutfit({
    feelsLikeC: toCelsius(current.apparentTemperature, units.temperature),
    precipProbability: worstRainChance(hours),
    windKmh: toKmh(current.windSpeed, units.wind),
    uvIndex: current.uvIndex,
    isDay: current.isDay,
  })

  return (
    <section className={styles.card} aria-labelledby="outfit-heading">
      <h2 id="outfit-heading" className={styles.heading}>
        What to wear
      </h2>
      <p className={styles.summary}>{outfit.summary}</p>
      <ul className={styles.items}>
        {outfit.items.map((item) => (
          <li key={item} className={styles.item}>
            {item}
          </li>
        ))}
      </ul>
      {outfit.tips.length > 0 && (
        <ul className={styles.tips}>
          {outfit.tips.map((tip) => (
            <li key={tip}>{tip}</li>
          ))}
        </ul>
      )}
    </section>
  )
}
