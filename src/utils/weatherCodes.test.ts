import { describeWeatherCode } from './weatherCodes'

describe('describeWeatherCode', () => {
  it.each([
    [0, 'Clear sky', 'clear'],
    [2, 'Partly cloudy', 'cloudy'],
    [45, 'Fog', 'fog'],
    [53, 'Moderate drizzle', 'drizzle'],
    [63, 'Moderate rain', 'rain'],
    [75, 'Heavy snow', 'snow'],
    [95, 'Thunderstorm', 'thunderstorm'],
  ])('maps code %i to "%s" in group %s', (code, description, group) => {
    expect(describeWeatherCode(code)).toMatchObject({ description, group })
  })

  it('uses different icons for day and night when they differ', () => {
    expect(describeWeatherCode(0, true).icon).not.toBe(describeWeatherCode(0, false).icon)
  })

  it('defaults to the day variant', () => {
    expect(describeWeatherCode(0).icon).toBe(describeWeatherCode(0, true).icon)
  })

  it('falls back to an unknown condition for unmapped codes', () => {
    expect(describeWeatherCode(1234)).toMatchObject({
      description: 'Unknown conditions',
      group: 'cloudy',
    })
  })
})
