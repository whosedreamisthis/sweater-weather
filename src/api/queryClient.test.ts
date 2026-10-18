import { createQueryClient, shouldRetry } from './queryClient'

describe('shouldRetry', () => {
  it('retries network errors up to twice', () => {
    expect(shouldRetry(0, new Error('network'))).toBe(true)
    expect(shouldRetry(1, new Error('network'))).toBe(true)
    expect(shouldRetry(2, new Error('network'))).toBe(false)
  })

  it('retries 5xx errors', () => {
    expect(shouldRetry(0, { status: 503 })).toBe(true)
  })

  it('never retries 4xx errors', () => {
    expect(shouldRetry(0, { status: 400 })).toBe(false)
    expect(shouldRetry(0, { status: 404 })).toBe(false)
  })
})

describe('createQueryClient', () => {
  it('applies the default query options', () => {
    const { staleTime, retry } = createQueryClient().getDefaultOptions().queries ?? {}

    expect(staleTime).toBe(5 * 60 * 1000)
    expect(retry).toBe(shouldRetry)
  })
})
