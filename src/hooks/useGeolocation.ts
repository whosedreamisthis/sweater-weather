import { useCallback, useEffect, useRef, useState } from 'react'
import type { Coordinates } from '../api/types'

export type GeolocationStatus =
  | 'idle'
  | 'loading'
  | 'success'
  | 'denied'
  | 'unavailable'
  | 'timeout'

const TIMEOUT_MS = 10_000
const DECIMALS = 2

/** Rounded for better query cache hits and so we never keep a precise position. */
export function roundCoordinate(value: number): number {
  return Number(value.toFixed(DECIMALS))
}

/** Locates the user only when `locate` is called, never on mount. */
export function useGeolocation() {
  const [status, setStatus] = useState<GeolocationStatus>('idle')
  const mounted = useRef(true)

  useEffect(() => {
    mounted.current = true
    return () => {
      mounted.current = false
    }
  }, [])

  const locate = useCallback((onSuccess?: (coords: Coordinates) => void) => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setStatus('unavailable')
      return
    }
    setStatus('loading')
    navigator.geolocation.getCurrentPosition(
      (position) => {
        if (!mounted.current) return
        setStatus('success')
        onSuccess?.({
          latitude: roundCoordinate(position.coords.latitude),
          longitude: roundCoordinate(position.coords.longitude),
        })
      },
      (error) => {
        if (!mounted.current) return
        if (error.code === 1) setStatus('denied')
        else if (error.code === 3) setStatus('timeout')
        else setStatus('unavailable')
      },
      { timeout: TIMEOUT_MS, maximumAge: 5 * 60_000 },
    )
  }, [])

  return { status, locate }
}

export const GEOLOCATION_MESSAGES: Partial<Record<GeolocationStatus, string>> = {
  denied: 'Location access was blocked. Search for a city above instead.',
  unavailable:
    'We couldn’t get your location on this device or browser. Search for a city above instead.',
  timeout: 'Finding your location took too long. Try again or search for a city above.',
}
