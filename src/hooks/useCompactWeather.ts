import { useQuery } from '@tanstack/react-query'
import { fetchCompactWeather } from '../api/weather'
import { useAppStore } from '../store/useAppStore'

/** Lightweight current conditions for list cards; only the temperature unit affects it. */
export function useCompactWeather(lat: number, lon: number) {
  const temperatureUnit = useAppStore((s) => s.units.temperature)
  const query = useQuery({
    queryKey: ['compact-weather', lat, lon, temperatureUnit],
    queryFn: ({ signal }) => fetchCompactWeather(lat, lon, temperatureUnit, signal),
    // Keep the old reading while a unit switch refetches, but never another place's.
    placeholderData: (previous, previousQuery) =>
      previousQuery?.queryKey[1] === lat && previousQuery.queryKey[2] === lon
        ? previous
        : undefined,
  })

  return { data: query.data, isError: query.isError, refetch: query.refetch }
}
