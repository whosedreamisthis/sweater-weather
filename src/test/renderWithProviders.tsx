import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render } from '@testing-library/react'
import type { ReactElement } from 'react'
import { MemoryRouter } from 'react-router'

export function createTestQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
}

type Options = {
  /** Initial URL for the MemoryRouter. */
  route?: string
  /** Set false when `ui` already provides its own router (e.g. RouterProvider). */
  router?: boolean
  queryClient?: QueryClient
}

export function renderWithProviders(
  ui: ReactElement,
  { route = '/', router = true, queryClient = createTestQueryClient() }: Options = {},
) {
  const content = router ? (
    <MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter>
  ) : (
    ui
  )

  return {
    queryClient,
    ...render(
      <QueryClientProvider client={queryClient}>{content}</QueryClientProvider>,
    ),
  }
}
