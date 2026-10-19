import { fetchJson, isRecord, unexpectedResponse } from './http'
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

/** `current` may be absent (no coverage), but when present it needs a timestamp. */
export function isRawAirQuality(value: unknown): value is RawAirQuality {
  if (!isRecord(value)) return false
  const { current } = value
  return current === undefined || (isRecord(current) && typeof current.time === 'string')
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
  const raw = await fetchJson(`${AIR_QUALITY_URL}?${params}`)
  if (!isRawAirQuality(raw)) throw unexpectedResponse()
  return transformAirQuality(raw)
}
