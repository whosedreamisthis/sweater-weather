/** Path to a city's weather page; the name is display-only and rides along as a query param. */
export function cityPath(latitude: number, longitude: number, name: string): string {
  return `/city/${latitude}/${longitude}?name=${encodeURIComponent(name)}`
}
