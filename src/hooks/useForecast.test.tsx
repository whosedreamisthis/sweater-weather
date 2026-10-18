import { QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { http, HttpResponse } from 'msw'
import { server } from '../test/server'
import { FORECAST_URL, forecastFixture } from '../test/handlers'
import { createTestQueryClient } from '../test/renderWithProviders'
import { DEFAULT_UNITS, useAppStore } from '../store/useAppStore'
import { useForecast } from './useForecast'

function wrapper({ children }: { children: ReactNode }) {
  return <QueryClientProvider client={createTestQueryClient()}>{children}</QueryClientProvider>
}

afterEach(() => {
  useAppStore.setState({ units: DEFAULT_UNITS })
})

describe('useForecast', () => {
  it('returns a row-oriented forecast on success', async () => {
    const { result } = renderHook(() => useForecast(51.5, -0.12), { wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.current.temperature).toBe(14.2)
    expect(result.current.data?.hourly).toHaveLength(2)
    expect(result.current.data?.daily[0].tempMax).toBe(15.4)
  })

  it('surfaces invalid coordinates as an error without a request', async () => {
    const spy = vi.spyOn(globalThis, 'fetch')

    const { result } = renderHook(() => useForecast(999, 0), { wrapper })

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(result.current.error?.message).toBe('Invalid coordinates.')
    expect(spy).not.toHaveBeenCalled()
    spy.mockRestore()
  })

  it('surfaces server failures through isError', async () => {
    server.use(
      http.get(FORECAST_URL, () =>
        HttpResponse.json({ error: true, reason: 'Service down.' }, { status: 500 }),
      ),
    )

    const { result } = renderHook(() => useForecast(51.5, -0.12), { wrapper })

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(result.current.error?.message).toBe('Service down.')
  })

  it('refetches with the new units when the store changes', async () => {
    const units: string[] = []
    server.use(
      http.get(FORECAST_URL, ({ request }) => {
        units.push(new URL(request.url).searchParams.get('temperature_unit') ?? '')
        return HttpResponse.json(forecastFixture)
      }),
    )

    const { result } = renderHook(() => useForecast(51.5, -0.12), { wrapper })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    act(() => {
      useAppStore.setState({ units: { ...DEFAULT_UNITS, temperature: 'fahrenheit' } })
    })

    await waitFor(() => expect(units).toEqual(['celsius', 'fahrenheit']))
  })
})
