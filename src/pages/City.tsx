import { useEffect } from 'react'
import { useParams, useSearchParams } from 'react-router'
import { ApiError } from '../api/http'
import { AirQualityCard } from '../components/airquality/AirQualityCard'
import { CurrentWeather } from '../components/current/CurrentWeather'
import { CurrentWeatherSkeleton } from '../components/current/CurrentWeatherSkeleton'
import { ErrorState } from '../components/current/ErrorState'
import { FavoriteButton } from '../components/favorites/FavoriteButton'
import { FavoriteButtonSkeleton } from '../components/favorites/FavoriteButtonSkeleton'
import { DailyList } from '../components/daily/DailyList'
import { DailyListSkeleton } from '../components/daily/DailyListSkeleton'
import { OutfitCard } from '../components/outfit/OutfitCard'
import { HourlyList } from '../components/hourly/HourlyList'
import { HourlyListSkeleton } from '../components/hourly/HourlyListSkeleton'
import { useForecast } from '../hooks/useForecast'
import { useNow } from '../hooks/useNow'
import { useReverseGeocode } from '../hooks/useReverseGeocode'
import { minutesAgo } from '../utils/format'
import { sliceHourly } from '../utils/hourly'
import styles from './City.module.css'

const APP_NAME = 'SweaterWeather'

export function City() {
  const params = useParams()
  const [search] = useSearchParams()
  const lat = Number(params.lat)
  const lon = Number(params.lon)
  const givenName = search.get('name')?.trim()
  const country = search.get('country')?.trim() ?? ''

  const now = useNow()
  const forecast = useForecast(lat, lon)

  // Pasted/shared coordinate links carry no name; look one up once the forecast confirms they're valid.
  const lookup = useReverseGeocode(lat, lon, !givenName && forecast.isSuccess)
  const name = givenName || lookup.data || `${params.lat}, ${params.lon}`

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
      <div>
        {/* A live region needs text to announce; the skeletons only carry labels. */}
        <p role="status" className={styles.visuallyHidden}>
          Loading weather…
        </p>
        <FavoriteButtonSkeleton />
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
        // Remount per place so a "list is full" message doesn't follow you to the next city.
        key={`${lat},${lon}`}
        location={{
          id: 0,
          name,
          country,
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
