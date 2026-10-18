import { useEffect } from 'react'
import { useParams, useSearchParams } from 'react-router'
import { ApiError } from '../api/http'
import { CurrentWeather } from '../components/current/CurrentWeather'
import { CurrentWeatherSkeleton } from '../components/current/CurrentWeatherSkeleton'
import { ErrorState } from '../components/current/ErrorState'
import { useForecast } from '../hooks/useForecast'
import { useNow } from '../hooks/useNow'
import { useAppStore } from '../store/useAppStore'
import { minutesAgo } from '../utils/format'

const APP_NAME = 'SweaterWeather'

export function City() {
  const params = useParams()
  const [search] = useSearchParams()
  const lat = Number(params.lat)
  const lon = Number(params.lon)
  const name = search.get('name')?.trim() || `${params.lat}, ${params.lon}`

  const units = useAppStore((s) => s.units)
  const now = useNow()
  const forecast = useForecast(lat, lon)

  useEffect(() => {
    document.title = `${name} · ${APP_NAME}`
    return () => {
      document.title = APP_NAME
    }
  }, [name])

  if (forecast.isError) {
    const invalid = forecast.error instanceof ApiError && forecast.error.status === 400
    return invalid ? (
      <ErrorState
        title="Location not found"
        message="Those coordinates don't look right. Try searching for a city instead."
      />
    ) : (
      <ErrorState
        title="Couldn't load the weather"
        message="Something went wrong fetching the latest conditions. Check your connection and try again."
        onRetry={() => void forecast.refetch()}
      />
    )
  }

  if (!forecast.data) {
    return (
      <div aria-live="polite">
        <CurrentWeatherSkeleton />
      </div>
    )
  }

  return (
    <CurrentWeather
      name={name}
      current={forecast.data.current}
      units={units}
      updatedMinutes={minutesAgo(forecast.dataUpdatedAt, now)}
      isRefetching={forecast.isFetching}
    />
  )
}
