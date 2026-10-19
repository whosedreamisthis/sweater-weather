import { useQuery } from '@tanstack/react-query'
import { fetchAirQuality } from '../api/airQuality'

export function useAirQuality(lat: number, lon: number) {
  return useQuery({
    queryKey: ['air-quality', lat, lon],
    queryFn: () => fetchAirQuality(lat, lon),
  })
}
