import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import type { StateStorage } from 'zustand/middleware'
import type { Units } from '../api/types'

type AppState = {
  units: Units
  setUnits: (units: Partial<Units>) => void
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
    (set) => ({
      units: defaultUnitsFor(language),
      setUnits: (units) => set((state) => ({ units: { ...state.units, ...units } })),
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => safeStorage),
      partialize: (state) => ({ units: state.units }),
    },
  ),
)
