import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  DEFAULT_UNITS,
  IMPERIAL_UNITS,
  MAX_FAVORITES,
  STORAGE_KEY,
  defaultUnitsFor,
  safeStorage,
  useAppStore,
} from './useAppStore'

/** Node's experimental global localStorage shadows jsdom's, so stub an in-memory one. */
function createMemoryStorage() {
  const data = new Map<string, string>()
  return {
    getItem: vi.fn((k: string) => data.get(k) ?? null),
    setItem: vi.fn((k: string, v: string) => void data.set(k, v)),
    removeItem: vi.fn((k: string) => void data.delete(k)),
    clear: () => data.clear(),
  }
}

let storage: ReturnType<typeof createMemoryStorage>

beforeEach(() => {
  storage = createMemoryStorage()
  vi.stubGlobal('localStorage', storage)
  useAppStore.setState({ units: DEFAULT_UNITS })
})

afterEach(() => vi.unstubAllGlobals())

describe('defaultUnitsFor', () => {
  it('uses imperial for en-US and metric otherwise', () => {
    expect(defaultUnitsFor('en-US')).toEqual(IMPERIAL_UNITS)
    expect(defaultUnitsFor('en-GB')).toEqual(DEFAULT_UNITS)
    expect(defaultUnitsFor('de-DE')).toEqual(DEFAULT_UNITS)
    expect(defaultUnitsFor(undefined)).toEqual(DEFAULT_UNITS)
  })
})

describe('setUnits', () => {
  it('merges a partial update and leaves other units alone', () => {
    useAppStore.getState().setUnits({ temperature: 'fahrenheit' })
    expect(useAppStore.getState().units).toEqual({ ...DEFAULT_UNITS, temperature: 'fahrenheit' })

    useAppStore.getState().setUnits({ wind: 'mph', precipitation: 'inch' })
    expect(useAppStore.getState().units).toEqual(IMPERIAL_UNITS)
  })

  it('persists units and favorites to localStorage under the sweater-weather key', () => {
    useAppStore.getState().setUnits({ wind: 'mph' })
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}')
    expect(saved.state).toEqual({
      units: { ...DEFAULT_UNITS, wind: 'mph' },
      theme: 'system',
      favorites: [],
    })
  })

  it('restores saved units on rehydrate', async () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ state: { units: IMPERIAL_UNITS }, version: 0 }),
    )
    await useAppStore.persist.rehydrate()
    expect(useAppStore.getState().units).toEqual(IMPERIAL_UNITS)
  })
})

describe('rehydrate validation', () => {
  const rehydrateWith = async (state: unknown) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ state, version: 0 }))
    await useAppStore.persist.rehydrate()
  }

  it('drops malformed favorites and keeps valid ones', async () => {
    const good = {
      id: 1,
      name: 'London',
      country: 'UK',
      latitude: 51.5,
      longitude: -0.12,
      timezone: 'Europe/London',
    }
    await rehydrateWith({
      favorites: [good, { name: 'Bad', latitude: '1', longitude: null }, 'junk', null],
    })
    expect(useAppStore.getState().favorites).toEqual([good])
  })

  it('falls back to defaults when favorites is not an array', async () => {
    await rehydrateWith({ favorites: { not: 'an array' } })
    expect(useAppStore.getState().favorites).toEqual([])
  })

  it('replaces invalid unit values individually', async () => {
    await rehydrateWith({ units: { temperature: 'kelvin', wind: 'mph', precipitation: 5 } })
    expect(useAppStore.getState().units).toEqual({ ...DEFAULT_UNITS, wind: 'mph' })
  })
})

describe('safeStorage', () => {
  it('swallows errors when localStorage is unavailable', () => {
    storage.getItem.mockImplementation(() => {
      throw new Error('blocked')
    })
    storage.setItem.mockImplementation(() => {
      throw new Error('quota')
    })
    storage.removeItem.mockImplementation(() => {
      throw new Error('blocked')
    })

    expect(safeStorage.getItem('k')).toBeNull()
    expect(() => safeStorage.setItem('k', 'v')).not.toThrow()
    expect(() => safeStorage.removeItem('k')).not.toThrow()
  })

  it('keeps the store working when writes fail', () => {
    storage.setItem.mockImplementation(() => {
      throw new Error('quota')
    })
    useAppStore.getState().setUnits({ temperature: 'fahrenheit' })
    expect(useAppStore.getState().units.temperature).toBe('fahrenheit')
  })
})

describe('favorites', () => {
  const place = (latitude: number, longitude: number) => ({
    id: 0,
    name: 'Somewhere',
    country: '',
    latitude,
    longitude,
    timezone: 'UTC',
  })

  beforeEach(() => useAppStore.setState({ favorites: [] }))

  it('adds and removes by coordinates', () => {
    expect(useAppStore.getState().addFavorite(place(51.5, -0.12))).toBe('added')
    expect(useAppStore.getState().favorites).toHaveLength(1)
    useAppStore.getState().removeFavorite(51.5, -0.12)
    expect(useAppStore.getState().favorites).toEqual([])
  })

  it('dedupes by coordinates', () => {
    useAppStore.getState().addFavorite(place(51.5, -0.12))
    expect(useAppStore.getState().addFavorite(place(51.50001, -0.12))).toBe('duplicate')
    expect(useAppStore.getState().favorites).toHaveLength(1)
  })

  it('caps at MAX_FAVORITES', () => {
    for (let i = 0; i < MAX_FAVORITES; i++) useAppStore.getState().addFavorite(place(i, i))
    expect(useAppStore.getState().addFavorite(place(50, 50))).toBe('full')
    expect(useAppStore.getState().favorites).toHaveLength(MAX_FAVORITES)
  })

  it('persists favorites', () => {
    useAppStore.getState().addFavorite(place(51.5, -0.12))
    expect(storage.setItem).toHaveBeenCalled()
    const saved = JSON.parse(storage.setItem.mock.calls.at(-1)![1] as string)
    expect(saved.state.favorites).toHaveLength(1)
  })
})
