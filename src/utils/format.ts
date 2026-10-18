const COMPASS = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'] as const

export function compassDirection(degrees: number): string {
  const normalized = ((degrees % 360) + 360) % 360
  return COMPASS[Math.round(normalized / 45) % 8]
}

export function formatVisibility(metres: number | null): string {
  if (metres === null) return '—'
  const km = metres / 1000
  return `${km >= 10 ? Math.round(km) : km.toFixed(1)} km`
}

export function minutesAgo(timestamp: number, now: number): number {
  return Math.max(0, Math.floor((now - timestamp) / 60_000))
}

export function formatUpdated(minutes: number): string {
  if (minutes < 1) return 'Updated just now'
  return `Updated ${minutes} min ago`
}
