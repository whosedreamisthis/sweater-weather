import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useAppStore, STORAGE_KEY } from '../store/useAppStore'
import { applyTheme, resolveTheme, watchTheme } from './theme'

type Listener = () => void

function mockMatchMedia(initialDark: boolean) {
  let dark = initialDark
  const listeners = new Set<Listener>()
  const query = {
    get matches() {
      return dark
    },
    addEventListener: (_: string, fn: Listener) => listeners.add(fn),
    removeEventListener: (_: string, fn: Listener) => listeners.delete(fn),
  }
  vi.stubGlobal('matchMedia', () => query)
  return {
    setDark(value: boolean) {
      dark = value
      listeners.forEach((fn) => fn())
    },
    listenerCount: () => listeners.size,
  }
}

/** Node's experimental global localStorage shadows jsdom's, so stub an in-memory one. */
function stubLocalStorage() {
  const data = new Map<string, string>()
  vi.stubGlobal('localStorage', {
    getItem: (k: string) => data.get(k) ?? null,
    setItem: (k: string, v: string) => void data.set(k, v),
    removeItem: (k: string) => void data.delete(k),
  })
}

beforeEach(() => {
  stubLocalStorage()
  delete document.documentElement.dataset.theme
  useAppStore.setState({ theme: 'system' })
})

afterEach(() => vi.unstubAllGlobals())

describe('theme store', () => {
  it('defaults to system and persists changes', () => {
    expect(useAppStore.getState().theme).toBe('system')
    useAppStore.getState().setTheme('dark')
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}')
    expect(saved.state.theme).toBe('dark')
  })

  it('ignores an invalid stored theme on rehydrate', async () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ state: { theme: 'neon' }, version: 0 }))
    await useAppStore.persist.rehydrate()
    expect(useAppStore.getState().theme).toBe('system')
  })

  it('restores a stored theme on rehydrate', async () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ state: { theme: 'light' }, version: 0 }))
    await useAppStore.persist.rehydrate()
    expect(useAppStore.getState().theme).toBe('light')
  })
})

describe('resolveTheme / applyTheme', () => {
  it('resolves system from prefers-color-scheme', () => {
    mockMatchMedia(true)
    expect(resolveTheme('system')).toBe('dark')
    mockMatchMedia(false)
    expect(resolveTheme('system')).toBe('light')
  })

  it('returns explicit themes unchanged', () => {
    mockMatchMedia(true)
    expect(resolveTheme('light')).toBe('light')
  })

  it('sets data-theme on <html>', () => {
    applyTheme('dark')
    expect(document.documentElement.dataset.theme).toBe('dark')
    applyTheme('light')
    expect(document.documentElement.dataset.theme).toBe('light')
  })
})

describe('watchTheme', () => {
  it('follows system preference changes and stops after cleanup', () => {
    const media = mockMatchMedia(false)
    const stop = watchTheme('system')
    expect(document.documentElement.dataset.theme).toBe('light')

    media.setDark(true)
    expect(document.documentElement.dataset.theme).toBe('dark')

    stop()
    expect(media.listenerCount()).toBe(0)
    media.setDark(false)
    expect(document.documentElement.dataset.theme).toBe('dark')
  })

  it('does not listen to the system when a theme is chosen explicitly', () => {
    const media = mockMatchMedia(false)
    watchTheme('dark')
    expect(media.listenerCount()).toBe(0)
    media.setDark(false)
    expect(document.documentElement.dataset.theme).toBe('dark')
  })
})
