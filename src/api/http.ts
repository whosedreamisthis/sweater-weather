/** Status 0 means the request never got a response (offline, DNS, CORS). */
export const NETWORK_ERROR_STATUS = 0

export class ApiError extends Error {
  readonly status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/** For a 2xx response whose body doesn't match the shape we expect. */
export function unexpectedResponse(): ApiError {
  return new ApiError('The weather service returned an unexpected response.', 502)
}

async function readErrorReason(response: Response): Promise<string> {
  try {
    const body: unknown = await response.json()
    if (typeof body === 'object' && body !== null && 'reason' in body) {
      const { reason } = body as { reason: unknown }
      if (typeof reason === 'string') return reason
    }
  } catch {
    // fall through to the generic message
  }
  return `Weather service error (${response.status}).`
}

export type FetchOptions = {
  /** Caller cancellation (e.g. TanStack Query's signal); rethrown untouched so it isn't reported as an error. */
  signal?: AbortSignal
  /** Abort and fail as a network error if there's no response in time. */
  timeoutMs?: number
}

export async function fetchJson(url: string, options: FetchOptions = {}): Promise<unknown> {
  const { signal, timeoutMs } = options
  const controller = new AbortController()
  const abort = () => controller.abort(signal?.reason)
  if (signal?.aborted) abort()
  else signal?.addEventListener('abort', abort, { once: true })
  const timer = timeoutMs === undefined ? undefined : setTimeout(abort, timeoutMs)

  try {
    let response: Response
    try {
      response = await fetch(url, { signal: controller.signal })
    } catch (error) {
      if (signal?.aborted) throw error
      throw new ApiError(
        'Could not reach the weather service. Check your connection.',
        NETWORK_ERROR_STATUS,
      )
    }

    if (!response.ok) {
      throw new ApiError(await readErrorReason(response), response.status)
    }

    try {
      return await response.json()
    } catch (error) {
      if (signal?.aborted) throw error
      throw new ApiError('The weather service returned an unreadable response.', response.status)
    }
  } finally {
    clearTimeout(timer)
    signal?.removeEventListener('abort', abort)
  }
}
