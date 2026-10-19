import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { fetchForecast } from '../api/weather'
import { useAppStore } from '../store/useAppStore'

export function useForecast(lat: number, lon: number) {
  const units = useAppStore((s) => s.units)
  const query = useQuery({
    queryKey: ['weather', lat, lon, units],
    queryFn: () => fetchForecast(lat, lon, units),
    // Switching units keeps the old card on screen until the new data lands, so the
    // page doesn't flash a skeleton. Never reuse another place's data.
    placeholderData: (previous, previousQuery) =>
      previousQuery?.queryKey[1] === lat && previousQuery.queryKey[2] === lon
        ? previous
        : undefined,
  })

  // Units the visible data was fetched in, so placeholder values keep their own labels.
  const [settledUnits, setSettledUnits] = useState(units)
  if (query.data && !query.isPlaceholderData && settledUnits !== units) {
    setSettledUnits(units)
  }

  // Pick fields explicitly: spreading `query` reads every getter and subscribes
  // consumers to all state changes, defeating TanStack's tracked-props optimization.
  return {
    data: query.data,
    error: query.error,
    isError: query.isError,
    isSuccess: query.isSuccess,
    isFetching: query.isFetching,
    dataUpdatedAt: query.dataUpdatedAt,
    refetch: query.refetch,
    units: query.isPlaceholderData ? settledUnits : units,
  }
}
