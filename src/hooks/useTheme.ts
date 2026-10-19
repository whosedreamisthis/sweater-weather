import { useEffect } from 'react'
import { useAppStore } from '../store/useAppStore'
import { watchTheme } from '../utils/theme'

/** Keeps `data-theme` on <html> in sync with the stored preference (and the OS for `system`). */
export function useTheme() {
  const theme = useAppStore((s) => s.theme)
  useEffect(() => watchTheme(theme), [theme])
}
