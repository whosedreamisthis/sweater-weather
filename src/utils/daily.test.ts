import { formatClock, formatWeekday } from './daily'

describe('formatWeekday', () => {
  it('labels the first day "Today" and others by weekday', () => {
    expect(formatWeekday('2026-10-18', true, 'en-US')).toBe('Today')
    expect(formatWeekday('2026-10-19', false, 'en-US')).toBe('Monday')
  })
})

describe('formatClock', () => {
  it('formats the location-local clock time', () => {
    expect(formatClock('2026-10-18T07:12', 'en-US')).toBe('7:12 AM')
    expect(formatClock('2026-10-18T17:48', 'en-US')).toBe('5:48 PM')
  })
})
