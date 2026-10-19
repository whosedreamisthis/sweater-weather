import { useQuery } from '@tanstack/react-query'
import { MIN_QUERY_LENGTH, searchCities } from '../api/geocoding'

const ONE_HOUR_MS = 60 * 60 * 1000

export function useCitySearch(query: string) {
  const term = query.trim()
  return useQuery({
    queryKey: ['geocoding', term.toLowerCase()],
    queryFn: ({ signal }) => searchCities(term, signal),
    enabled: term.length >= MIN_QUERY_LENGTH,
    staleTime: ONE_HOUR_MS,
  })
}
