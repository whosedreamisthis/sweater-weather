import type { DailyPoint, HourlyPoint } from '../api/types'
import { formatHour, isDaytime, sliceHourly } from './hourly'

function hours(startDay: number, count: number): HourlyPoint[] {
  return Array.from({ length: count }, (_, i) => {
    const day = startDay + Math.floor(i / 24)
    const hour = String(i % 24).padStart(2, '0')
    return {
      time: `2026-10-${String(day).padStart(2, '0')}T${hour}:00`,
      temperature: i,
      precipitationProbability: 0,
      weatherCode: 0,
    }
  })
}

describe('sliceHourly', () => {
  it('starts at the current hour rather than midnight and returns 24 items', () => {
    const result = sliceHourly(hours(18, 72), '2026-10-18T12:00')
    expect(result).toHaveLength(24)
    expect(result[0].time).toBe('2026-10-18T12:00')
    expect(result[23].time).toBe('2026-10-19T11:00')
  })

  it('floors a mid-hour current time to the hour', () => {
    expect(sliceHourly(hours(18, 72), '2026-10-18T12:45')[0].time).toBe('2026-10-18T12:00')
  })

  it('rolls over midnight and month boundaries', () => {
    const points = ['2026-10-31T22:00', '2026-10-31T23:00', '2026-11-01T00:00', '2026-11-01T01:00'].map(
      (time) => ({ time, temperature: 0, precipitationProbability: 0, weatherCode: 0 }),
    )
    expect(sliceHourly(points, '2026-10-31T23:30').map((p) => p.time)).toEqual([
      '2026-10-31T23:00',
      '2026-11-01T00:00',
      '2026-11-01T01:00',
    ])
  })

  it('returns nothing for empty data', () => {
    expect(sliceHourly([], '2026-10-18T12:00')).toEqual([])
  })

  it('returns what is left when the data ends early, and nothing when it is stale', () => {
    expect(sliceHourly(hours(18, 24), '2026-10-18T20:00')).toHaveLength(4)
    expect(sliceHourly(hours(18, 24), '2026-10-25T00:00')).toEqual([])
  })
})

describe('formatHour', () => {
  it('uses the location-local hour regardless of the viewer timezone', () => {
    expect(formatHour('2026-10-18T15:00', 'en-US')).toBe('3 PM')
    expect(formatHour('2026-10-18T00:00', 'en-US')).toBe('12 AM')
  })

  it('follows the locale 24-hour default', () => {
    expect(formatHour('2026-10-18T15:00', 'de-DE')).toMatch(/^15/)
  })
})

describe('isDaytime', () => {
  const daily = [
    { date: '2026-10-18', sunrise: '2026-10-18T07:12', sunset: '2026-10-18T17:48' },
  ] as DailyPoint[]

  it('compares against that date’s sunrise and sunset', () => {
    expect(isDaytime('2026-10-18T12:00', daily)).toBe(true)
    expect(isDaytime('2026-10-18T22:00', daily)).toBe(false)
    expect(isDaytime('2026-10-18T05:00', daily)).toBe(false)
  })

  it('treats sunrise as day and sunset as night', () => {
    expect(isDaytime('2026-10-18T07:12', daily)).toBe(true)
    expect(isDaytime('2026-10-18T17:48', daily)).toBe(false)
  })

  it('defaults to day when the date is unknown', () => {
    expect(isDaytime('2026-10-20T22:00', daily)).toBe(true)
  })
})
