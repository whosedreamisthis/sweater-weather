import { ApiError, fetchJson } from './http'
import type { Location } from './types'

const GEOCODING_URL = 'https://geocoding-api.open-meteo.com/v1/search'
const RESULT_COUNT = 5
const MIN_QUERY_LENGTH = 2

type RawLocation = {
  id: number
  name: string
  country?: string
  admin1?: string
  latitude: number
  longitude: number
  timezone?: string
}

/** Open-Meteo omits `results` entirely when nothing matches. */
export function transformLocations(raw: { results?: RawLocation[] } | null): Location[] {
  const results = raw?.results
  if (!Array.isArray(results)) return []
  return results.map((r) => ({
    id: r.id,
    name: r.name,
    country: r.country ?? '',
    ...(r.admin1 ? { admin1: r.admin1 } : {}),
    latitude: r.latitude,
    longitude: r.longitude,
    timezone: r.timezone ?? 'UTC',
  }))
}

export async function searchCities(query: string): Promise<Location[]> {
  const name = query.trim()
  if (name.length < MIN_QUERY_LENGTH) {
    throw new ApiError('Enter at least 2 characters to search.', 400)
  }
  const params = new URLSearchParams({
    name,
    count: String(RESULT_COUNT),
    language: 'en',
    format: 'json',
  })
  const raw = (await fetchJson(`${GEOCODING_URL}?${params}`)) as { results?: RawLocation[] } | null
  return transformLocations(raw)
}
