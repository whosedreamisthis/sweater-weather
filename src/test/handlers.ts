import { http, HttpResponse } from 'msw'
import type { RequestHandler } from 'msw'
import type { RawAirQuality } from '../api/airQuality'
import type { RawForecast } from '../api/weather'

export const GEOCODING_URL = 'https://geocoding-api.open-meteo.com/v1/search'
export const FORECAST_URL = 'https://api.open-meteo.com/v1/forecast'

export const geocodingFixture = {
  results: [
    {
      id: 2643743,
      name: 'London',
      latitude: 51.50853,
      longitude: -0.12574,
      country: 'United Kingdom',
      admin1: 'England',
      timezone: 'Europe/London',
    },
    {
      id: 6058560,
      name: 'London',
      latitude: 42.98339,
      longitude: -81.23304,
      country: 'Canada',
      timezone: 'America/Toronto',
    },
  ],
}

export const AIR_QUALITY_URL = 'https://air-quality-api.open-meteo.com/v1/air-quality'

export const airQualityFixture: RawAirQuality = {
  latitude: 51.5,
  longitude: -0.12,
  current: { time: '2026-10-18T12:00', us_aqi: 42, pm2_5: 8.4, pm10: 14.9 },
}

export const forecastFixture: RawForecast = {
  latitude: 51.5,
  longitude: -0.12,
  timezone: 'Europe/London',
  current: {
    time: '2026-10-18T12:00',
    temperature_2m: 14.2,
    apparent_temperature: 12.8,
    relative_humidity_2m: 71,
    is_day: 1,
    weather_code: 3,
    wind_speed_10m: 11.5,
    wind_direction_10m: 240,
    surface_pressure: 1008.4,
    uv_index: 2.1,
    visibility: 24100,
  },
  hourly: {
    time: ['2026-10-18T12:00', '2026-10-18T13:00'],
    temperature_2m: [14.2, 15.1],
    precipitation_probability: [10, null],
    weather_code: [3, 61],
  },
  daily: {
    time: ['2026-10-18', '2026-10-19'],
    weather_code: [3, 61],
    temperature_2m_max: [15.4, 13.9],
    temperature_2m_min: [8.1, 7.7],
    precipitation_probability_max: [20, 65],
    sunrise: ['2026-10-18T07:12', '2026-10-19T07:14'],
    sunset: ['2026-10-18T17:48', '2026-10-19T17:46'],
    uv_index_max: [2.4, null],
  },
}

export const handlers: RequestHandler[] = [
  http.get(GEOCODING_URL, () => HttpResponse.json(geocodingFixture)),
  http.get(FORECAST_URL, () => HttpResponse.json(forecastFixture)),
  http.get(AIR_QUALITY_URL, () => HttpResponse.json(airQualityFixture)),
]
