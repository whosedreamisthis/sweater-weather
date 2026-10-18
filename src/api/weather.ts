import { ApiError, fetchJson } from './http'
import type { CurrentWeather, DailyPoint, Forecast, HourlyPoint, Units } from './types'

const FORECAST_URL = 'https://api.open-meteo.com/v1/forecast'

const CURRENT_VARS =
  'temperature_2m,apparent_temperature,relative_humidity_2m,is_day,weather_code,wind_speed_10m,wind_direction_10m,surface_pressure'
const HOURLY_VARS = 'temperature_2m,precipitation_probability,weather_code'
const DAILY_VARS =
  'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,sunrise,sunset,uv_index_max'

export type RawForecast = {
  latitude: number
  longitude: number
  timezone: string
  current: {
    time: string
    temperature_2m: number
    apparent_temperature: number
    relative_humidity_2m: number
    is_day: number
    weather_code: number
    wind_speed_10m: number
    wind_direction_10m: number
    surface_pressure: number
  }
  hourly: {
    time: string[]
    temperature_2m: number[]
    precipitation_probability: Array<number | null>
    weather_code: number[]
  }
  daily: {
    time: string[]
    weather_code: number[]
    temperature_2m_max: number[]
    temperature_2m_min: number[]
    precipitation_probability_max: Array<number | null>
    sunrise: string[]
    sunset: string[]
    uv_index_max: Array<number | null>
  }
}

export function validateCoordinates(lat: number, lon: number): void {
  const valid =
    Number.isFinite(lat) && Number.isFinite(lon) && Math.abs(lat) <= 90 && Math.abs(lon) <= 180
  if (!valid) throw new ApiError('Invalid coordinates.', 400)
}

function transformCurrent(c: RawForecast['current']): CurrentWeather {
  return {
    time: c.time,
    temperature: c.temperature_2m,
    apparentTemperature: c.apparent_temperature,
    weatherCode: c.weather_code,
    isDay: c.is_day === 1,
    humidity: c.relative_humidity_2m,
    windSpeed: c.wind_speed_10m,
    windDirection: c.wind_direction_10m,
    pressure: c.surface_pressure,
  }
}

function transformHourly(h: RawForecast['hourly']): HourlyPoint[] {
  return h.time.map((time, i) => ({
    time,
    temperature: h.temperature_2m[i],
    precipitationProbability: h.precipitation_probability[i] ?? 0,
    weatherCode: h.weather_code[i],
  }))
}

function transformDaily(d: RawForecast['daily']): DailyPoint[] {
  return d.time.map((date, i) => ({
    date,
    tempMax: d.temperature_2m_max[i],
    tempMin: d.temperature_2m_min[i],
    precipitationProbabilitySum: d.precipitation_probability_max[i] ?? 0,
    weatherCode: d.weather_code[i],
    sunrise: d.sunrise[i],
    sunset: d.sunset[i],
    uvIndexMax: d.uv_index_max[i] ?? 0,
  }))
}

export function transformForecast(raw: RawForecast): Forecast {
  return {
    location: { latitude: raw.latitude, longitude: raw.longitude, timezone: raw.timezone },
    current: transformCurrent(raw.current),
    hourly: transformHourly(raw.hourly),
    daily: transformDaily(raw.daily),
  }
}

export async function fetchForecast(lat: number, lon: number, units: Units): Promise<Forecast> {
  validateCoordinates(lat, lon)
  const params = new URLSearchParams({
    latitude: String(lat),
    longitude: String(lon),
    current: CURRENT_VARS,
    hourly: HOURLY_VARS,
    daily: DAILY_VARS,
    temperature_unit: units.temperature,
    wind_speed_unit: units.wind,
    precipitation_unit: units.precipitation,
    timezone: 'auto',
  })
  const raw = (await fetchJson(`${FORECAST_URL}?${params}`)) as RawForecast
  return transformForecast(raw)
}
