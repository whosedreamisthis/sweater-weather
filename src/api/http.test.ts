import { http, HttpResponse } from 'msw'
import { server } from '../test/server'
import { ApiError, fetchJson } from './http'

const URL = 'https://example.test/data'

describe('fetchJson', () => {
  it('returns the parsed body on 2xx', async () => {
    server.use(http.get(URL, () => HttpResponse.json({ ok: true })))

    await expect(fetchJson(URL)).resolves.toEqual({ ok: true })
  })

  it('throws ApiError when a 2xx body is not valid JSON', async () => {
    server.use(http.get(URL, () => new HttpResponse('<html>oops</html>', { status: 200 })))

    const error = await fetchJson(URL).catch((e: unknown) => e)

    expect(error).toBeInstanceOf(ApiError)
    expect(error).toMatchObject({ status: 200, message: expect.stringContaining('unreadable') })
  })

  it('rethrows the abort error when the caller cancels', async () => {
    server.use(
      http.get(URL, async () => {
        await new Promise((resolve) => setTimeout(resolve, 200))
        return HttpResponse.json({ ok: true })
      }),
    )
    const controller = new AbortController()

    const pending = fetchJson(URL, { signal: controller.signal }).catch((e: unknown) => e)
    controller.abort()

    const error = await pending
    expect(error).not.toBeInstanceOf(ApiError)
    expect(error).toMatchObject({ name: 'AbortError' })
  })

  it('fails as a network error when the timeout elapses', async () => {
    server.use(
      http.get(URL, async () => {
        await new Promise((resolve) => setTimeout(resolve, 200))
        return HttpResponse.json({ ok: true })
      }),
    )

    await expect(fetchJson(URL, { timeoutMs: 20 })).rejects.toMatchObject({
      name: 'ApiError',
      status: 0,
    })
  })

  it('ignores a non-string reason and uses the generic message', async () => {
    server.use(http.get(URL, () => HttpResponse.json({ reason: 42 }, { status: 429 })))

    await expect(fetchJson(URL)).rejects.toMatchObject({
      status: 429,
      message: 'Weather service error (429).',
    })
  })
})
