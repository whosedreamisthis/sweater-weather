/**
 * Path to a city's weather page. The name and country are display-only and ride along
 * as query params so the page can label (and save) the place without another lookup.
 */
export function cityPath(
  latitude: number,
  longitude: number,
  name: string,
  country?: string,
): string {
  const countryParam = country ? `&country=${encodeURIComponent(country)}` : ''
  return `/city/${latitude}/${longitude}?name=${encodeURIComponent(name)}${countryParam}`
}
