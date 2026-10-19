import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import type { StateStorage } from 'zustand/middleware'
import type { Coordinates, Location, Units } from '../api/types'
import { isTheme } from '../utils/theme'
import type { Theme } from '../utils/theme'

export type FavoriteResult = 'added' | 'duplicate' | 'full'

export const MAX_FAVORITES = 10

type AppState = {
  units: Units
  setUnits: (units: Partial<Units>) => void
  theme: Theme
  setTheme: (theme: Theme) => void
  favorites: Location[]
  addFavorite: (location: Location) => FavoriteResult
  removeFavorite: (latitude: number, longitude: number) => void
}

/** Same place if the coordinates match to ~1 km; guards against float noise and URL rounding. */
export function sameCoordinates(a: Coordinates, b: Coordinates): boolean {
  return (
    a.latitude.toFixed(2) === b.latitude.toFixed(2) &&
    a.longitude.toFixed(2) === b.longitude.toFixed(2)
  )
}

export function isFavorite(favorites: Location[], latitude: number, longitude: number): boolean {
  return favorites.some((f) => sameCoordinates(f, { latitude, longitude }))
}

export const STORAGE_KEY = 'sweater-weather'

export const DEFAULT_UNITS: Units = {
  temperature: 'celsius',
  wind: 'kmh',
  precipitation: 'mm',
}

export const IMPERIAL_UNITS: Units = {
  temperature: 'fahrenheit',
  wind: 'mph',
  precipitation: 'inch',
}

/** US English defaults to imperial; everything else to metric. */
export function defaultUnitsFor(language: string | undefined): Units {
  return language === 'en-US' ? IMPERIAL_UNITS : DEFAULT_UNITS
}

/** localStorage can throw (blocked, private mode, quota); the app must keep working. */
export const safeStorage: StateStorage = {
  getItem: (name) => {
    try {
      return localStorage.getItem(name)
    } catch {
      return null
    }
  },
  setItem: (name, value) => {
    try {
      localStorage.setItem(name, value)
    } catch {
      // Ignore: units simply won't persist.
    }
  },
  removeItem: (name) => {
    try {
      localStorage.removeItem(name)
    } catch {
      // Ignore.
    }
  },
}

function isLocation(value: unknown): value is Location {
  if (typeof value !== 'object' || value === null) return false
  const v = value as Record<string, unknown>
  return (
    typeof v.id === 'number' &&
    typeof v.name === 'string' &&
    typeof v.country === 'string' &&
    (v.admin1 === undefined || typeof v.admin1 === 'string') &&
    typeof v.timezone === 'string' &&
    typeof v.latitude === 'number' &&
    Number.isFinite(v.latitude) &&
    typeof v.longitude === 'number' &&
    Number.isFinite(v.longitude)
  )
}

function sanitizeUnits(value: unknown, fallback: Units): Units {
  const v = (typeof value === 'object' && value !== null ? value : {}) as Record<string, unknown>
  return {
    temperature:
      v.temperature === 'celsius' || v.temperature === 'fahrenheit'
        ? v.temperature
        : fallback.temperature,
    wind: v.wind === 'kmh' || v.wind === 'mph' ? v.wind : fallback.wind,
    precipitation:
      v.precipitation === 'mm' || v.precipitation === 'inch' ? v.precipitation : fallback.precipitation,
  }
}

const language = typeof navigator === 'undefined' ? undefined : navigator.language

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      units: defaultUnitsFor(language),
      setUnits: (units) => set((state) => ({ units: { ...state.units, ...units } })),
      theme: 'system',
      setTheme: (theme) => set({ theme }),
      favorites: [],
      addFavorite: (location) => {
        const { favorites } = get()
        if (isFavorite(favorites, location.latitude, location.longitude)) return 'duplicate'
        if (favorites.length >= MAX_FAVORITES) return 'full'
        set({ favorites: [...favorites, location] })
        return 'added'
      },
      removeFavorite: (latitude, longitude) =>
        set((state) => ({
          favorites: state.favorites.filter((f) => !sameCoordinates(f, { latitude, longitude })),
        })),
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => safeStorage),
      partialize: (state) => ({
        units: state.units,
        theme: state.theme,
        favorites: state.favorites,
      }),
      // Never trust stored JSON: it may be hand-edited or from an older schema.
      merge: (persisted, current) => {
        const p = (typeof persisted === 'object' && persisted !== null ? persisted : {}) as {
          units?: unknown
          theme?: unknown
          favorites?: unknown
        }
        return {
          ...current,
          theme: isTheme(p.theme) ? p.theme : current.theme,
          units: sanitizeUnits(p.units, current.units),
          favorites: Array.isArray(p.favorites)
            ? p.favorites.filter(isLocation).slice(0, MAX_FAVORITES)
            : [],
        }
      },
    },
  ),
)
