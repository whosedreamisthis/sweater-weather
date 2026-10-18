import { QueryClient } from '@tanstack/react-query'

const MAX_RETRIES = 2

function getStatus(error: unknown): number | undefined {
  if (typeof error === 'object' && error !== null && 'status' in error) {
    const { status } = error as { status: unknown }
    return typeof status === 'number' ? status : undefined
  }
  return undefined
}

/** Retry up to twice, but never on 4xx (the request itself is wrong). */
export function shouldRetry(failureCount: number, error: unknown): boolean {
  const status = getStatus(error)
  if (status !== undefined && status >= 400 && status < 500) return false
  return failureCount < MAX_RETRIES
}

export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000,
        retry: shouldRetry,
      },
    },
  })
}
