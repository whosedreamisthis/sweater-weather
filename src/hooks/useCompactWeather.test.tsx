import { QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { http, HttpResponse } from 'msw'
import { server } from '../test/server'
import { FORECAST_URL, forecastFixture } from '../test/handlers'
import { createTestQueryClient } from '../test/renderWithProviders'
import { DEFAULT_UNITS, useAppStore } from '../store/useAppStore'
import { useCompactWeather } from './useCompactWeather'

function wrapper({ children }: { children: ReactNode }) {
  return <QueryClientProvider client={createTestQueryClient()}>{children}</QueryClientProvider>
}

beforeEach(() => {
  useAppStore.setState({ units: DEFAULT_UNITS })
})

describe('useCompactWeather', () => {
  it('requests only current conditions, not hourly or daily data', async () => {
    let params = new URLSearchParams()
    server.use(
      http.get(FORECAST_URL, ({ request }) => {
        params = new URL(request.url).searchParams
        return HttpResponse.json(forecastFixture)
      }),
    )

    const { result } = renderHook(() => useCompactWeather(51.5, -0.12), { wrapper })

    await waitFor(() => expect(result.current.data).toBeDefined())
    expect(result.current.data).toMatchObject({ temperature: 14.2, temperatureUnit: 'celsius' })
    expect(params.get('current')).toBe('temperature_2m,is_day,weather_code')
    expect(params.has('hourly')).toBe(false)
    expect(params.has('daily')).toBe(false)
  })

  it('surfaces an unexpected response through isError', async () => {
    server.use(http.get(FORECAST_URL, () => HttpResponse.json({ current: {} })))

    const { result } = renderHook(() => useCompactWeather(51.5, -0.12), { wrapper })

    await waitFor(() => expect(result.current.isError).toBe(true))
  })

  it('refetches when the temperature unit changes', async () => {
    const units: string[] = []
    server.use(
      http.get(FORECAST_URL, ({ request }) => {
        units.push(new URL(request.url).searchParams.get('temperature_unit') ?? '')
        return HttpResponse.json(forecastFixture)
      }),
    )

    const { result } = renderHook(() => useCompactWeather(51.5, -0.12), { wrapper })
    await waitFor(() => expect(result.current.data).toBeDefined())

    act(() => {
      useAppStore.setState({ units: { ...DEFAULT_UNITS, temperature: 'fahrenheit' } })
    })

    await waitFor(() => expect(units).toEqual(['celsius', 'fahrenheit']))
  })
})
