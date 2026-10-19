import type { HourlyPoint } from '../api/types'
import { getOutfit, toCelsius, toKmh, worstRainChance } from './outfit'

const calm = { precipProbability: 0, windKmh: 0, uvIndex: 0, isDay: true }

describe('getOutfit temperature bands', () => {
  it.each([
    [-5, 'Bundle up', ['Heavy coat', 'Hat', 'Gloves']],
    [0, 'Bundle up', ['Heavy coat', 'Hat', 'Gloves']],
    [0.5, 'Wear a warm jacket', ['Warm jacket']],
    [10.9, 'Wear a warm jacket', ['Warm jacket']],
    [11, 'Bring a sweater', ['Sweater']],
    [17.9, 'Bring a sweater', ['Sweater']],
    [18, 'Light layers will do', ['Light layers']],
    [24.9, 'Light layers will do', ['Light layers']],
    [25, 'Dress light', ['Light clothing']],
    [35, 'Dress light', ['Light clothing']],
  ])('%s °C -> %s', (feelsLikeC, summary, items) => {
    expect(getOutfit({ ...calm, feelsLikeC })).toEqual({ summary, items, tips: [] })
  })
})

describe('getOutfit extras', () => {
  const base = { ...calm, feelsLikeC: 15 }

  it('adds rain gear at 40% and not below', () => {
    expect(getOutfit({ ...base, precipProbability: 39 }).items).toEqual(['Sweater'])
    const wet = getOutfit({ ...base, precipProbability: 40 })
    expect(wet.items).toContain('Umbrella or rain jacket')
    expect(wet.tips[0]).toMatch(/40%/)
  })

  it('adds a windbreaker at 30 km/h and not below', () => {
    expect(getOutfit({ ...base, windKmh: 29.9 }).items).not.toContain('Windbreaker')
    expect(getOutfit({ ...base, windKmh: 30 }).items).toContain('Windbreaker')
  })

  it('adds sun protection at UV 6 by day only', () => {
    expect(getOutfit({ ...base, uvIndex: 5.9 }).items).not.toContain('Sunscreen')
    expect(getOutfit({ ...base, uvIndex: 6 }).items).toEqual(['Sweater', 'Sunscreen', 'Sunglasses'])
    expect(getOutfit({ ...base, uvIndex: 8, isDay: false }).items).toEqual(['Sweater'])
  })
})

describe('unit conversion', () => {
  it('converts Fahrenheit and mph to metric', () => {
    expect(toCelsius(32, 'fahrenheit')).toBeCloseTo(0)
    expect(toCelsius(59, 'fahrenheit')).toBeCloseTo(15)
    expect(toCelsius(15, 'celsius')).toBe(15)
    expect(toKmh(10, 'mph')).toBeCloseTo(16.09, 1)
    expect(toKmh(10, 'kmh')).toBe(10)
  })

  it('gives the same outfit for equivalent imperial and metric readings', () => {
    const metric = getOutfit({ ...calm, feelsLikeC: toCelsius(10, 'celsius') })
    const imperial = getOutfit({ ...calm, feelsLikeC: toCelsius(50, 'fahrenheit') })
    expect(imperial).toEqual(metric)
  })
})

describe('worstRainChance', () => {
  const hours: HourlyPoint[] = [10, 20, 70, 5, 0, 0, 90].map((p, i) => ({
    time: `2026-10-18T${String(i).padStart(2, '0')}:00`,
    temperature: 10,
    precipitationProbability: p,
    weatherCode: 0,
  }))

  it('takes the maximum across the lookahead window only', () => {
    expect(worstRainChance(hours)).toBe(70)
    expect(worstRainChance(hours, 2)).toBe(20)
    expect(worstRainChance([])).toBe(0)
  })
})
