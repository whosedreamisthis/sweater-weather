import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import type { StateStorage } from 'zustand/middleware'
import type { Location, Units } from '../api/types'

export type FavoriteResult = 'added' | 'duplicate' | 'full'

export const MAX_FAVORITES = 10

type AppState = {
  units: Units
  setUnits: (units: Partial<Units>) => void
  favorites: Location[]
  addFavorite: (location: Location) => FavoriteResult
  removeFavorite: (latitude: number, longitude: number) => void
}

type Coordinates = Pick<Location, 'latitude' | 'longitude'>

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

const language = typeof navigator === 'undefined' ? undefined : navigator.language

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      units: defaultUnitsFor(language),
      setUnits: (units) => set((state) => ({ units: { ...state.units, ...units } })),
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
      partialize: (state) => ({ units: state.units, favorites: state.favorites }),
    },
  ),
)
