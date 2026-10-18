import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  DEFAULT_UNITS,
  IMPERIAL_UNITS,
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

  it('persists only units to localStorage under the sweater-weather key', () => {
    useAppStore.getState().setUnits({ wind: 'mph' })
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}')
    expect(saved.state).toEqual({ units: { ...DEFAULT_UNITS, wind: 'mph' } })
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
