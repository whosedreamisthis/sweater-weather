import { http, HttpResponse } from 'msw'
import { server } from '../test/server'
import { FORECAST_URL, forecastFixture } from '../test/handlers'
import { DEFAULT_UNITS } from '../store/useAppStore'
import { ApiError } from './http'
import { fetchForecast, transformForecast } from './weather'

describe('transformForecast', () => {
  const forecast = transformForecast(forecastFixture)

  it('maps current conditions', () => {
    expect(forecast.current).toEqual({
      time: '2026-10-18T12:00',
      temperature: 14.2,
      apparentTemperature: 12.8,
      weatherCode: 3,
      isDay: true,
      humidity: 71,
      windSpeed: 11.5,
      windDirection: 240,
      pressure: 1008.4,
    })
  })

  it('turns hourly columns into rows, defaulting null probability to 0', () => {
    expect(forecast.hourly).toEqual([
      { time: '2026-10-18T12:00', temperature: 14.2, precipitationProbability: 10, weatherCode: 3 },
      { time: '2026-10-18T13:00', temperature: 15.1, precipitationProbability: 0, weatherCode: 61 },
    ])
  })

  it('turns daily columns into rows, defaulting null UV to 0', () => {
    expect(forecast.daily).toHaveLength(2)
    expect(forecast.daily[0]).toEqual({
      date: '2026-10-18',
      tempMax: 15.4,
      tempMin: 8.1,
      precipitationProbabilitySum: 20,
      weatherCode: 3,
      sunrise: '2026-10-18T07:12',
      sunset: '2026-10-18T17:48',
      uvIndexMax: 2.4,
    })
    expect(forecast.daily[1].uvIndexMax).toBe(0)
  })

  it('reports isDay false at night', () => {
    const night = transformForecast({
      ...forecastFixture,
      current: { ...forecastFixture.current, is_day: 0 },
    })
    expect(night.current.isDay).toBe(false)
  })

  it('exposes coordinates and timezone as location', () => {
    expect(forecast.location).toEqual({
      latitude: 51.5,
      longitude: -0.12,
      timezone: 'Europe/London',
    })
  })
})

describe('fetchForecast', () => {
  it('requests all sections with units and timezone=auto', async () => {
    let url = new URL('about:blank')
    server.use(
      http.get(FORECAST_URL, ({ request }) => {
        url = new URL(request.url)
        return HttpResponse.json(forecastFixture)
      }),
    )

    await fetchForecast(51.5, -0.12, {
      temperature: 'fahrenheit',
      wind: 'mph',
      precipitation: 'inch',
    })

    expect(url.searchParams.get('latitude')).toBe('51.5')
    expect(url.searchParams.get('longitude')).toBe('-0.12')
    expect(url.searchParams.get('timezone')).toBe('auto')
    expect(url.searchParams.get('temperature_unit')).toBe('fahrenheit')
    expect(url.searchParams.get('wind_speed_unit')).toBe('mph')
    expect(url.searchParams.get('precipitation_unit')).toBe('inch')
    expect(url.searchParams.get('current')).toContain('apparent_temperature')
    expect(url.searchParams.get('hourly')).toContain('precipitation_probability')
    expect(url.searchParams.get('daily')).toContain('uv_index_max')
  })

  it.each([
    [91, 0],
    [-91, 0],
    [0, 181],
    [0, -181],
    [Number.NaN, 0],
    [0, Number.POSITIVE_INFINITY],
  ])('rejects invalid coordinates (%s, %s) without a request', async (lat, lon) => {
    const spy = vi.spyOn(globalThis, 'fetch')

    await expect(fetchForecast(lat, lon, DEFAULT_UNITS)).rejects.toMatchObject({
      name: 'ApiError',
      status: 400,
    })
    expect(spy).not.toHaveBeenCalled()
    spy.mockRestore()
  })

  it('throws ApiError with the server reason on non-2xx', async () => {
    server.use(
      http.get(FORECAST_URL, () =>
        HttpResponse.json({ error: true, reason: 'Latitude must be in range.' }, { status: 400 }),
      ),
    )

    const error = await fetchForecast(10, 10, DEFAULT_UNITS).catch((e: unknown) => e)

    expect(error).toBeInstanceOf(ApiError)
    expect(error).toMatchObject({ status: 400, message: 'Latitude must be in range.' })
  })

  it('falls back to a generic message when the error body is not JSON', async () => {
    server.use(http.get(FORECAST_URL, () => new HttpResponse('Bad gateway', { status: 502 })))

    await expect(fetchForecast(10, 10, DEFAULT_UNITS)).rejects.toMatchObject({
      status: 502,
      message: 'Weather service error (502).',
    })
  })

  it('throws a status-0 ApiError on network failure', async () => {
    server.use(http.get(FORECAST_URL, () => HttpResponse.error()))

    await expect(fetchForecast(10, 10, DEFAULT_UNITS)).rejects.toMatchObject({
      name: 'ApiError',
      status: 0,
    })
  })
})
