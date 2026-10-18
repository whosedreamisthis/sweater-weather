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

export async function fetchJson(url: string): Promise<unknown> {
  let response: Response
  try {
    response = await fetch(url)
  } catch {
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
  } catch {
    throw new ApiError('The weather service returned an unreadable response.', response.status)
  }
}
