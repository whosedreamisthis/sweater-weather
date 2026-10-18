import { QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { http, HttpResponse } from 'msw'
import { server } from '../test/server'
import { GEOCODING_URL } from '../test/handlers'
import { createTestQueryClient } from '../test/renderWithProviders'
import { useCitySearch } from './useCitySearch'

function wrapper({ children }: { children: ReactNode }) {
  return <QueryClientProvider client={createTestQueryClient()}>{children}</QueryClientProvider>
}

describe('useCitySearch', () => {
  it('returns matching cities on success', async () => {
    const { result } = renderHook(() => useCitySearch('London'), { wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.map((c) => c.country)).toEqual(['United Kingdom', 'Canada'])
  })

  it('stays disabled below 2 characters and makes no request', () => {
    const spy = vi.spyOn(globalThis, 'fetch')

    const { result } = renderHook(() => useCitySearch(' L '), { wrapper })

    expect(result.current.fetchStatus).toBe('idle')
    expect(result.current.data).toBeUndefined()
    expect(spy).not.toHaveBeenCalled()
    spy.mockRestore()
  })

  it('surfaces failures through isError with a message', async () => {
    server.use(
      http.get(GEOCODING_URL, () =>
        HttpResponse.json({ error: true, reason: 'Service down.' }, { status: 500 }),
      ),
    )

    const { result } = renderHook(() => useCitySearch('London'), { wrapper })

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(result.current.error?.message).toBe('Service down.')
  })
})
