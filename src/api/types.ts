export type Units = {
  temperature: 'celsius' | 'fahrenheit'
  wind: 'kmh' | 'mph'
  precipitation: 'mm' | 'inch'
}

export type Location = {
  id: number
  name: string
  country: string
  admin1?: string
  latitude: number
  longitude: number
  timezone: string
}

export type CurrentWeather = {
  time: string
  temperature: number
  apparentTemperature: number
  weatherCode: number
  isDay: boolean
  humidity: number
  windSpeed: number
  windDirection: number
  pressure: number
  uvIndex: number
  /** Metres; null when the service has no reading. */
  visibility: number | null
}

export type HourlyPoint = {
  time: string
  temperature: number
  precipitationProbability: number
  weatherCode: number
}

export type DailyPoint = {
  date: string
  tempMax: number
  tempMin: number
  precipitationProbabilitySum: number
  weatherCode: number
  sunrise: string
  sunset: string
  uvIndexMax: number
}

/** The forecast endpoint only knows coordinates and timezone, not a place name. */
export type ForecastLocation = Pick<Location, 'latitude' | 'longitude' | 'timezone'>

export type Forecast = {
  location: ForecastLocation
  current: CurrentWeather
  hourly: HourlyPoint[]
  daily: DailyPoint[]
}
