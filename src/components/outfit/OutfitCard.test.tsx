import { render, screen } from '@testing-library/react'
import type { CurrentWeather, HourlyPoint } from '../../api/types'
import { DEFAULT_UNITS, IMPERIAL_UNITS } from '../../store/useAppStore'
import { OutfitCard } from './OutfitCard'

const current: CurrentWeather = {
  time: '2026-10-18T12:00',
  temperature: 12,
  apparentTemperature: 10,
  weatherCode: 3,
  isDay: true,
  humidity: 60,
  windSpeed: 10,
  windDirection: 90,
  pressure: 1010,
  uvIndex: 2,
  visibility: 10000,
}

const hours = (probabilities: number[]): HourlyPoint[] =>
  probabilities.map((p, i) => ({
    time: `2026-10-18T${12 + i}:00`,
    temperature: 10,
    precipitationProbability: p,
    weatherCode: 3,
  }))

describe('OutfitCard', () => {
  it('suggests a warm jacket for a chilly, dry day', () => {
    render(<OutfitCard current={current} hours={hours([0, 5])} units={DEFAULT_UNITS} />)

    expect(screen.getByRole('heading', { name: 'What to wear' })).toBeInTheDocument()
    expect(screen.getByText('Wear a warm jacket')).toBeInTheDocument()
    expect(screen.queryByText('Umbrella or rain jacket')).not.toBeInTheDocument()
  })

  it('adds rain gear and wind protection for a wet, windy day', () => {
    render(
      <OutfitCard
        current={{ ...current, apparentTemperature: 14, windSpeed: 35 }}
        hours={hours([10, 80])}
        units={DEFAULT_UNITS}
      />,
    )

    expect(screen.getByText('Bring a sweater')).toBeInTheDocument()
    expect(screen.getByText('Umbrella or rain jacket')).toBeInTheDocument()
    expect(screen.getByText('Windbreaker')).toBeInTheDocument()
    expect(screen.getByText(/80% chance of rain/)).toBeInTheDocument()
  })

  it('gives the same advice when the user reads in imperial units', () => {
    // 10 °C = 50 °F and 10 km/h ≈ 6.2 mph
    render(
      <OutfitCard
        current={{ ...current, apparentTemperature: 50, windSpeed: 6.2 }}
        hours={hours([0])}
        units={IMPERIAL_UNITS}
      />,
    )

    expect(screen.getByText('Wear a warm jacket')).toBeInTheDocument()
  })
})
