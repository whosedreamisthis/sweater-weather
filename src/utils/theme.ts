export type Theme = 'light' | 'dark' | 'system'
export type ResolvedTheme = 'light' | 'dark'

export const THEMES: readonly Theme[] = ['light', 'dark', 'system']

export const DARK_QUERY = '(prefers-color-scheme: dark)'

export function isTheme(value: unknown): value is Theme {
  return value === 'light' || value === 'dark' || value === 'system'
}

/** matchMedia is missing in some environments (and old browsers); fall back to light. */
function darkMediaQuery(): MediaQueryList | null {
  return typeof window !== 'undefined' && typeof window.matchMedia === 'function'
    ? window.matchMedia(DARK_QUERY)
    : null
}

export function resolveTheme(theme: Theme): ResolvedTheme {
  if (theme === 'system') return darkMediaQuery()?.matches ? 'dark' : 'light'
  return theme
}

export function applyTheme(theme: Theme): void {
  const resolved = resolveTheme(theme)
  document.documentElement.dataset.theme = resolved
  document.documentElement.style.colorScheme = resolved
}

/** Applies the theme now and, for `system`, again whenever the OS preference changes. */
export function watchTheme(theme: Theme): () => void {
  applyTheme(theme)
  const query = theme === 'system' ? darkMediaQuery() : null
  if (!query) return () => {}
  const onChange = () => applyTheme(theme)
  query.addEventListener('change', onChange)
  return () => query.removeEventListener('change', onChange)
}
