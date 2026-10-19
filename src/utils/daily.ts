/** Weekday name of a location-local date ("2026-10-18"); the first row reads "Today". */
export function formatWeekday(date: string, isToday: boolean, locale?: string): string {
  if (isToday) return 'Today'
  const [year, month, day] = date.split('-').map(Number)
  return new Intl.DateTimeFormat(locale, { weekday: 'long', timeZone: 'UTC' }).format(
    Date.UTC(year, month - 1, day),
  )
}

/** Formats the clock of a location-local timestamp ("2026-10-18T07:12") as e.g. "7:12 AM". */
export function formatClock(time: string, locale?: string): string {
  const [date, clock = '00:00'] = time.split('T')
  const [year, month, day] = date.split('-').map(Number)
  const [hour, minute] = clock.split(':').map(Number)
  return new Intl.DateTimeFormat(locale, {
    hour: 'numeric',
    minute: '2-digit',
    timeZone: 'UTC',
  }).format(Date.UTC(year, month - 1, day, hour, minute))
}
