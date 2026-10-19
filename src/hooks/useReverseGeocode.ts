import { useMutation, useQuery } from '@tanstack/react-query'
import { reverseGeocode } from '../api/reverseGeocoding'
import type { Coordinates } from '../api/types'

/** City name for coordinates; a place's name doesn't change, so it never goes stale. */
export function useReverseGeocode(lat: number, lon: number, enabled: boolean) {
  return useQuery({
    queryKey: ['reverse-geocode', lat, lon],
    queryFn: ({ signal }) => reverseGeocode(lat, lon, signal),
    enabled,
    staleTime: Infinity,
  })
}

/** On-demand lookup (e.g. after "Use my location"); `isPending` covers the in-flight request. */
export function useReverseGeocodeMutation() {
  return useMutation({
    mutationFn: ({ latitude, longitude }: Coordinates) => reverseGeocode(latitude, longitude),
  })
}
