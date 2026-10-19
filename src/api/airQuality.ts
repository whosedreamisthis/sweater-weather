import { fetchJson } from './http'
import type { AirQuality } from './types'
import { validateCoordinates } from './weather'

const AIR_QUALITY_URL = 'https://air-quality-api.open-meteo.com/v1/air-quality'

const CURRENT_VARS = 'us_aqi,pm2_5,pm10'

export type RawAirQuality = {
  latitude: number
  longitude: number
  current?: {
    time: string
    us_aqi?: number | null
    pm2_5?: number | null
    pm10?: number | null
  }
}

export function transformAirQuality(raw: RawAirQuality): AirQuality | null {
  const c = raw.current
  if (!c) return null
  return {
    time: c.time,
    usAqi: c.us_aqi ?? null,
    pm25: c.pm2_5 ?? null,
    pm10: c.pm10 ?? null,
  }
}

export async function fetchAirQuality(lat: number, lon: number): Promise<AirQuality | null> {
  validateCoordinates(lat, lon)
  const params = new URLSearchParams({
    latitude: String(lat),
    longitude: String(lon),
    current: CURRENT_VARS,
    timezone: 'auto',
  })
  const raw = (await fetchJson(`${AIR_QUALITY_URL}?${params}`)) as RawAirQuality
  return transformAirQuality(raw)
}
