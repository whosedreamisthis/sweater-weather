import { create } from 'zustand'
import type { Units } from '../api/types'

type AppState = {
  units: Units
}

export const DEFAULT_UNITS: Units = {
  temperature: 'celsius',
  wind: 'kmh',
  precipitation: 'mm',
}

export const useAppStore = create<AppState>(() => ({
  units: DEFAULT_UNITS,
}))
