import { compassDirection, formatUpdated, formatVisibility, minutesAgo } from './format'

describe('compassDirection', () => {
  it.each([
    [0, 'N'],
    [44, 'NE'],
    [90, 'E'],
    [240, 'SW'],
    [350, 'N'],
    [360, 'N'],
    [-90, 'W'],
  ])('%i° is %s', (degrees, expected) => {
    expect(compassDirection(degrees)).toBe(expected)
  })
})

describe('formatVisibility', () => {
  it.each([
    [800, '0.8 km'],
    [9400, '9.4 km'],
    [24100, '24 km'],
    [null, '—'],
  ])('%i m is %s', (metres, expected) => {
    expect(formatVisibility(metres)).toBe(expected)
  })
})

describe('updated label', () => {
  it('floors elapsed minutes and never goes negative', () => {
    expect(minutesAgo(0, 125_000)).toBe(2)
    expect(minutesAgo(10_000, 0)).toBe(0)
  })

  it('reads naturally', () => {
    expect(formatUpdated(0)).toBe('Updated just now')
    expect(formatUpdated(3)).toBe('Updated 3 min ago')
  })
})
