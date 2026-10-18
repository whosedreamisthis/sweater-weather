import { useQuery } from '@tanstack/react-query'
import { fetchForecast } from '../api/weather'
import { useAppStore } from '../store/useAppStore'

export function useForecast(lat: number, lon: number) {
  const units = useAppStore((s) => s.units)
  return useQuery({
    queryKey: ['weather', lat, lon, units],
    queryFn: () => fetchForecast(lat, lon, units),
  })
}
