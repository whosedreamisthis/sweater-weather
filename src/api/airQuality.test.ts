import { http, HttpResponse } from 'msw'
import { server } from '../test/server'
import { AIR_QUALITY_URL, airQualityFixture } from '../test/handlers'
import { fetchAirQuality, transformAirQuality } from './airQuality'
import { ApiError } from './http'

describe('transformAirQuality', () => {
  it('maps the current readings', () => {
    expect(transformAirQuality(airQualityFixture)).toEqual({
      time: '2026-10-18T12:00',
      usAqi: 42,
      pm25: 8.4,
      pm10: 14.9,
    })
  })

  it('keeps missing readings as null instead of 0', () => {
    const result = transformAirQuality({
      ...airQualityFixture,
      current: { time: '2026-10-18T12:00', us_aqi: null },
    })
    expect(result).toEqual({ time: '2026-10-18T12:00', usAqi: null, pm25: null, pm10: null })
  })

  it('returns null when the response has no current block', () => {
    expect(transformAirQuality({ latitude: 0, longitude: 0 })).toBeNull()
  })
})

describe('fetchAirQuality', () => {
  it('requests the current AQI and particulate variables', async () => {
    let url: URL | undefined
    server.use(
      http.get(AIR_QUALITY_URL, ({ request }) => {
        url = new URL(request.url)
        return HttpResponse.json(airQualityFixture)
      }),
    )

    const result = await fetchAirQuality(51.5, -0.12)

    expect(result?.usAqi).toBe(42)
    expect(url?.searchParams.get('current')).toBe('us_aqi,pm2_5,pm10')
    expect(url?.searchParams.get('latitude')).toBe('51.5')
  })

  it('rejects invalid coordinates without a request', async () => {
    const spy = vi.spyOn(globalThis, 'fetch')
    await expect(fetchAirQuality(999, 0)).rejects.toMatchObject({ status: 400 })
    expect(spy).not.toHaveBeenCalled()
    spy.mockRestore()
  })

  it('throws an ApiError on server failure', async () => {
    server.use(
      http.get(AIR_QUALITY_URL, () =>
        HttpResponse.json({ error: true, reason: 'Boom' }, { status: 500 }),
      ),
    )
    await expect(fetchAirQuality(51.5, -0.12)).rejects.toBeInstanceOf(ApiError)
  })
})
