import { getAqiCategory } from './airQuality'

describe('getAqiCategory', () => {
  it.each([
    [0, 'Good', 0],
    [50, 'Good', 0],
    [51, 'Moderate', 1],
    [100, 'Moderate', 1],
    [101, 'Unhealthy for sensitive groups', 2],
    [150, 'Unhealthy for sensitive groups', 2],
    [151, 'Unhealthy', 3],
    [200, 'Unhealthy', 3],
    [201, 'Very unhealthy', 4],
    [300, 'Very unhealthy', 4],
    [301, 'Hazardous', 5],
    [500, 'Hazardous', 5],
  ])('maps AQI %i to %s (level %i)', (aqi, label, level) => {
    const category = getAqiCategory(aqi)
    expect(category.label).toBe(label)
    expect(category.level).toBe(level)
  })

  it('always provides a health note', () => {
    for (const aqi of [10, 75, 125, 175, 250, 400]) {
      expect(getAqiCategory(aqi).note.length).toBeGreaterThan(0)
    }
  })
})
