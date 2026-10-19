import { useEffect } from 'react'
import { useParams, useSearchParams } from 'react-router'
import { ApiError } from '../api/http'
import { AirQualityCard } from '../components/airquality/AirQualityCard'
import { CurrentWeather } from '../components/current/CurrentWeather'
import { CurrentWeatherSkeleton } from '../components/current/CurrentWeatherSkeleton'
import { ErrorState } from '../components/current/ErrorState'
import { FavoriteButton } from '../components/favorites/FavoriteButton'
import { DailyList } from '../components/daily/DailyList'
import { DailyListSkeleton } from '../components/daily/DailyListSkeleton'
import { OutfitCard } from '../components/outfit/OutfitCard'
import { HourlyList } from '../components/hourly/HourlyList'
import { HourlyListSkeleton } from '../components/hourly/HourlyListSkeleton'
import { useForecast } from '../hooks/useForecast'
import { useNow } from '../hooks/useNow'
import { minutesAgo } from '../utils/format'
import { sliceHourly } from '../utils/hourly'

const APP_NAME = 'SweaterWeather'

export function City() {
  const params = useParams()
  const [search] = useSearchParams()
  const lat = Number(params.lat)
  const lon = Number(params.lon)
  const name = search.get('name')?.trim() || `${params.lat}, ${params.lon}`

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
        <HourlyListSkeleton />
        <DailyListSkeleton />
      </div>
    )
  }

  const { current, hourly, daily } = forecast.data
  const upcoming = sliceHourly(hourly, current.time)
  return (
    <>
      <FavoriteButton
        location={{
          id: 0,
          name,
          country: '',
          latitude: lat,
          longitude: lon,
          timezone: forecast.data.location.timezone,
        }}
      />
      <CurrentWeather
        name={name}
        current={current}
        units={forecast.units}
        updatedMinutes={minutesAgo(forecast.dataUpdatedAt, now)}
        isRefetching={forecast.isFetching}
      />
      <AirQualityCard lat={lat} lon={lon} />
      <OutfitCard current={current} hours={upcoming} units={forecast.units} />
      <HourlyList hours={upcoming} daily={daily} units={forecast.units} />
      <DailyList days={daily} units={forecast.units} />
    </>
  )
}
