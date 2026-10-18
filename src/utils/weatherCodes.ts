export type WeatherGroup =
  | 'clear'
  | 'cloudy'
  | 'fog'
  | 'drizzle'
  | 'rain'
  | 'snow'
  | 'thunderstorm'

export type WeatherCondition = {
  description: string
  icon: string
  group: WeatherGroup
}

type CodeEntry = { description: string; group: WeatherGroup; day: string; night: string }

const entry = (description: string, group: WeatherGroup, day: string, night = day): CodeEntry => ({
  description,
  group,
  day,
  night,
})

const CODES: Record<number, CodeEntry> = {
  0: entry('Clear sky', 'clear', '☀️', '🌙'),
  1: entry('Mainly clear', 'clear', '🌤️', '🌙'),
  2: entry('Partly cloudy', 'cloudy', '⛅', '☁️'),
  3: entry('Overcast', 'cloudy', '☁️'),
  45: entry('Fog', 'fog', '🌫️'),
  48: entry('Rime fog', 'fog', '🌫️'),
  51: entry('Light drizzle', 'drizzle', '🌦️', '🌧️'),
  53: entry('Moderate drizzle', 'drizzle', '🌦️', '🌧️'),
  55: entry('Dense drizzle', 'drizzle', '🌧️'),
  56: entry('Light freezing drizzle', 'drizzle', '🌧️'),
  57: entry('Dense freezing drizzle', 'drizzle', '🌧️'),
  61: entry('Slight rain', 'rain', '🌦️', '🌧️'),
  63: entry('Moderate rain', 'rain', '🌧️'),
  65: entry('Heavy rain', 'rain', '🌧️'),
  66: entry('Light freezing rain', 'rain', '🌧️'),
  67: entry('Heavy freezing rain', 'rain', '🌧️'),
  71: entry('Slight snow', 'snow', '🌨️'),
  73: entry('Moderate snow', 'snow', '🌨️'),
  75: entry('Heavy snow', 'snow', '❄️'),
  77: entry('Snow grains', 'snow', '🌨️'),
  80: entry('Slight rain showers', 'rain', '🌦️', '🌧️'),
  81: entry('Moderate rain showers', 'rain', '🌧️'),
  82: entry('Violent rain showers', 'rain', '🌧️'),
  85: entry('Slight snow showers', 'snow', '🌨️'),
  86: entry('Heavy snow showers', 'snow', '❄️'),
  95: entry('Thunderstorm', 'thunderstorm', '⛈️'),
  96: entry('Thunderstorm with slight hail', 'thunderstorm', '⛈️'),
  99: entry('Thunderstorm with heavy hail', 'thunderstorm', '⛈️'),
}

const UNKNOWN: CodeEntry = entry('Unknown conditions', 'cloudy', '❔')

export function describeWeatherCode(code: number, isDay = true): WeatherCondition {
  const found = CODES[code] ?? UNKNOWN
  return {
    description: found.description,
    icon: isDay ? found.day : found.night,
    group: found.group,
  }
}
