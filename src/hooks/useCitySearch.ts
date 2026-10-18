import { useQuery } from '@tanstack/react-query'
import { searchCities } from '../api/geocoding'

const MIN_QUERY_LENGTH = 2
const ONE_HOUR_MS = 60 * 60 * 1000

export function useCitySearch(query: string) {
  const term = query.trim()
  return useQuery({
    queryKey: ['geocoding', term.toLowerCase()],
    queryFn: () => searchCities(term),
    enabled: term.length >= MIN_QUERY_LENGTH,
    staleTime: ONE_HOUR_MS,
  })
}
