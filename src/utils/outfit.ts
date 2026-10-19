import type { HourlyPoint, Units } from '../api/types'

export type OutfitInput = {
  feelsLikeC: number
  precipProbability: number
  windKmh: number
  uvIndex: number
  isDay: boolean
}

export type Outfit = {
  summary: string
  items: string[]
  tips: string[]
}

export const RAIN_THRESHOLD = 40
export const WIND_THRESHOLD_KMH = 30
export const UV_THRESHOLD = 6
/** How many upcoming hours (including the current one) count towards the rain chance. */
export const RAIN_LOOKAHEAD_HOURS = 6

const MPH_TO_KMH = 1.609344

export function toCelsius(value: number, unit: Units['temperature']): number {
  return unit === 'fahrenheit' ? ((value - 32) * 5) / 9 : value
}

export function toKmh(value: number, unit: Units['wind']): number {
  return unit === 'mph' ? value * MPH_TO_KMH : value
}

/** The highest rain chance across the next few hours, so a shower later today still counts. */
export function worstRainChance(hours: HourlyPoint[], count = RAIN_LOOKAHEAD_HOURS): number {
  return hours.slice(0, count).reduce((max, h) => Math.max(max, h.precipitationProbability), 0)
}

function layersFor(feelsLikeC: number): { summary: string; items: string[] } {
  if (feelsLikeC <= 0) {
    return { summary: 'Bundle up', items: ['Heavy coat', 'Hat', 'Gloves'] }
  }
  if (feelsLikeC < 11) {
    return { summary: 'Wear a warm jacket', items: ['Warm jacket'] }
  }
  if (feelsLikeC < 18) {
    return { summary: 'Bring a sweater', items: ['Sweater'] }
  }
  if (feelsLikeC < 25) {
    return { summary: 'Light layers will do', items: ['Light layers'] }
  }
  return { summary: 'Dress light', items: ['Light clothing'] }
}

export function getOutfit({
  feelsLikeC,
  precipProbability,
  windKmh,
  uvIndex,
  isDay,
}: OutfitInput): Outfit {
  const { summary, items } = layersFor(feelsLikeC)
  const outfitItems = [...items]
  const tips: string[] = []

  if (precipProbability >= RAIN_THRESHOLD) {
    outfitItems.push('Umbrella or rain jacket')
    tips.push(`Up to ${Math.round(precipProbability)}% chance of rain in the next few hours.`)
  }
  if (windKmh >= WIND_THRESHOLD_KMH) {
    outfitItems.push('Windbreaker')
    tips.push('It is windy, so it will feel colder than the thermometer says.')
  }
  // UV is irrelevant after dark, even if the current reading is stale.
  if (isDay && uvIndex >= UV_THRESHOLD) {
    outfitItems.push('Sunscreen', 'Sunglasses')
    tips.push('High UV: cover up or reapply sunscreen if you are out for long.')
  }

  return { summary, items: outfitItems, tips }
}
