import { fetchJson } from './http'

export const REVERSE_GEOCODING_URL = 'https://api-bdc.io/data/reverse-geocode-client'

export const FALLBACK_LOCATION_NAME = 'Current location'

/** The name is cosmetic, so don't make the user wait long for it. */
const REVERSE_TIMEOUT_MS = 5_000

/** OpenStreetMap-style admin level for a city/municipality. */
const CITY_ADMIN_LEVEL = 8

type RawReverse = {
  city?: string
  locality?: string
  localityInfo?: { administrative?: { name?: string; adminLevel?: number }[] }
} | null

/** Open-Meteo has no reverse geocoding, so the city name comes from BigDataCloud. */
export async function reverseGeocode(
  latitude: number,
  longitude: number,
  signal?: AbortSignal,
): Promise<string> {
  try {
    const params = new URLSearchParams({
      latitude: String(latitude),
      longitude: String(longitude),
      localityLanguage: 'en',
    })
    const raw = (await fetchJson(`${REVERSE_GEOCODING_URL}?${params}`, {
      signal,
      timeoutMs: REVERSE_TIMEOUT_MS,
    })) as RawReverse
    // `city` can be a regional district (e.g. Metro Vancouver), so prefer the municipality.
    const municipality = raw?.localityInfo?.administrative?.find(
      (a) => a.adminLevel === CITY_ADMIN_LEVEL,
    )?.name
    return (
      municipality?.trim() || raw?.city?.trim() || raw?.locality?.trim() || FALLBACK_LOCATION_NAME
    )
  } catch {
    return FALLBACK_LOCATION_NAME
  }
}
