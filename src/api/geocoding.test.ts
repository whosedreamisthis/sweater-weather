import { http, HttpResponse } from 'msw'
import { server } from '../test/server'
import { GEOCODING_URL } from '../test/handlers'
import { ApiError } from './http'
import { searchCities } from './geocoding'

describe('searchCities', () => {
  it('maps results to Location objects', async () => {
    const cities = await searchCities('London')

    expect(cities).toHaveLength(2)
    expect(cities[0]).toEqual({
      id: 2643743,
      name: 'London',
      country: 'United Kingdom',
      admin1: 'England',
      latitude: 51.50853,
      longitude: -0.12574,
      timezone: 'Europe/London',
    })
    expect(cities[1]).not.toHaveProperty('admin1')
  })

  it('sends the trimmed query and expected params', async () => {
    let url = new URL('about:blank')
    server.use(
      http.get(GEOCODING_URL, ({ request }) => {
        url = new URL(request.url)
        return HttpResponse.json({})
      }),
    )

    await searchCities('  Paris ')

    expect(url.searchParams.get('name')).toBe('Paris')
    expect(url.searchParams.get('count')).toBe('5')
  })

  it('returns an empty array when Open-Meteo omits results', async () => {
    server.use(http.get(GEOCODING_URL, () => HttpResponse.json({ generationtime_ms: 0.4 })))

    await expect(searchCities('zzzzzz')).resolves.toEqual([])
  })

  it('rejects queries shorter than 2 characters without a request', async () => {
    await expect(searchCities('a')).rejects.toMatchObject({ status: 400 })
  })

  it('throws ApiError with the server reason on non-2xx', async () => {
    server.use(
      http.get(GEOCODING_URL, () =>
        HttpResponse.json({ error: true, reason: 'Parameter count is bad.' }, { status: 400 }),
      ),
    )

    const error = await searchCities('London').catch((e: unknown) => e)

    expect(error).toBeInstanceOf(ApiError)
    expect(error).toMatchObject({ status: 400, message: 'Parameter count is bad.' })
  })

  it('throws a status-0 ApiError on network failure', async () => {
    server.use(http.get(GEOCODING_URL, () => HttpResponse.error()))

    await expect(searchCities('London')).rejects.toMatchObject({ name: 'ApiError', status: 0 })
  })
})
