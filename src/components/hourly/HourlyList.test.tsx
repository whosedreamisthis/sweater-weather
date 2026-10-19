import { render, screen, within } from '@testing-library/react'
import type { DailyPoint, HourlyPoint } from '../../api/types'
import { DEFAULT_UNITS, IMPERIAL_UNITS } from '../../store/useAppStore'
import { HourlyList } from './HourlyList'

const hours: HourlyPoint[] = [
  { time: '2026-10-18T12:00', temperature: 14.2, precipitationProbability: 10, weatherCode: 3 },
  { time: '2026-10-18T13:00', temperature: 15.1, precipitationProbability: 65, weatherCode: 61 },
]
const daily = [
  { date: '2026-10-18', sunrise: '2026-10-18T07:12', sunset: '2026-10-18T17:48' },
] as DailyPoint[]

describe('HourlyList', () => {
  it('renders each hour with "Now" on the first item', () => {
    render(<HourlyList hours={hours} daily={daily} units={DEFAULT_UNITS} />)

    const items = screen.getAllByRole('listitem')
    expect(items).toHaveLength(2)
    expect(within(items[0]).getByText('Now')).toBeInTheDocument()
    expect(within(items[0]).getByText('14°C')).toBeInTheDocument()
    expect(within(items[0]).getByText('10%')).toBeInTheDocument()
    expect(within(items[1]).queryByText('Now')).not.toBeInTheDocument()
    expect(within(items[1]).getByText('65% chance of precipitation')).toBeInTheDocument()
    expect(within(items[1]).getByText('65%')).toBeInTheDocument()
    expect(within(items[1]).getByRole('img', { name: 'Slight rain' })).toBeInTheDocument()
  })

  it('labels temperatures with the active units and is keyboard-focusable', () => {
    render(<HourlyList hours={hours} daily={daily} units={IMPERIAL_UNITS} />)

    expect(screen.getByText('14°F')).toBeInTheDocument()
    expect(screen.getByRole('list')).toHaveAttribute('tabindex', '0')
  })
})
