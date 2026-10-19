import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { DailyPoint } from '../../api/types'
import { DEFAULT_UNITS, IMPERIAL_UNITS } from '../../store/useAppStore'
import { DailyList } from './DailyList'

const days: DailyPoint[] = [
  {
    date: '2026-10-18',
    tempMax: 14.2,
    tempMin: 6,
    precipitationProbabilitySum: 65,
    weatherCode: 61,
    sunrise: '2026-10-18T07:12',
    sunset: '2026-10-18T17:48',
    uvIndexMax: 3.4,
  },
  {
    date: '2026-10-19',
    tempMax: 20,
    tempMin: 10,
    precipitationProbabilitySum: 5,
    weatherCode: 0,
    sunrise: '2026-10-19T07:14',
    sunset: '2026-10-19T17:46',
    uvIndexMax: 5,
  },
]

describe('DailyList', () => {
  it('renders a row per day with Today first and units-aware temperatures', () => {
    render(<DailyList days={days} units={DEFAULT_UNITS} />)

    const items = screen.getAllByRole('listitem')
    expect(items).toHaveLength(2)
    expect(within(items[0]).getByText('Today')).toBeInTheDocument()
    expect(within(items[0]).getByText('6°C')).toBeInTheDocument()
    expect(within(items[0]).getByText('14°C')).toBeInTheDocument()
    expect(within(items[0]).getByText('65% chance of precipitation')).toBeInTheDocument()
    expect(within(items[1]).queryByText('Today')).not.toBeInTheDocument()
    expect(within(items[1]).getByText('Monday')).toBeInTheDocument()
  })

  it('uses Fahrenheit labels when units say so', () => {
    render(<DailyList days={days} units={IMPERIAL_UNITS} />)
    expect(screen.getByText('6°F')).toBeInTheDocument()
  })

  it('reveals sunrise, sunset and UV when a row is expanded', async () => {
    const user = userEvent.setup()
    render(<DailyList days={days} units={DEFAULT_UNITS} />)

    const row = screen.getAllByRole('button')[0]
    expect(row).toHaveAttribute('aria-expanded', 'false')
    expect(screen.getAllByText('Sunrise')[0]).not.toBeVisible()

    await user.click(row)
    expect(row).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getAllByText('Sunrise')[0]).toBeVisible()
    expect(screen.getByText(/7:12/)).toBeVisible()
    expect(screen.getByText(/5:48/)).toBeVisible()
    expect(screen.getByText('3')).toBeVisible()
  })
})
