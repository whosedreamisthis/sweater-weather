import type { DailyPoint, HourlyPoint } from '../api/types'

export const HOURLY_COUNT = 24

/**
 * The API returns wall-clock times in the location's timezone ("2026-10-18T12:00"), so
 * they sort lexicographically and never need a Date (or the viewer's timezone).
 */
export function sliceHourly(
  hourly: HourlyPoint[],
  currentTime: string,
  count = HOURLY_COUNT,
): HourlyPoint[] {
  const currentHour = currentTime.slice(0, 13)
  const start = hourly.findIndex((point) => point.time.slice(0, 13) >= currentHour)
  return start === -1 ? [] : hourly.slice(start, start + count)
}

/** Formats the hour of a location-local timestamp using the viewer's 12/24-hour default. */
export function formatHour(time: string, locale?: string): string {
  const [date, clock = '00:00'] = time.split('T')
  const [year, month, day] = date.split('-').map(Number)
  const hour = Number(clock.slice(0, 2))
  return new Intl.DateTimeFormat(locale, { hour: 'numeric', timeZone: 'UTC' }).format(
    Date.UTC(year, month - 1, day, hour),
  )
}

/** Hourly data has no day/night flag, so derive it from that date's sunrise and sunset. */
export function isDaytime(time: string, daily: DailyPoint[]): boolean {
  const today = daily.find((d) => d.date === time.slice(0, 10))
  return today ? time >= today.sunrise && time < today.sunset : true
}
