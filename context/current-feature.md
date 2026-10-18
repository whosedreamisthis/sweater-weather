# Current Feature: Current Conditions

The City page hero card showing weather right now.

## Status

In Progress

## Goals

- `City` page reads `lat`/`lon` (and optional `name`) from the route and calls `useForecast`.
- `CurrentWeather` card: location name, large temperature, feels-like, condition icon and description, humidity, wind speed and direction, pressure, UV index, visibility.
- Day/night aware icon and accent styling from `is_day` and weather group.
- Skeleton loader matching the final card layout.
- Error state with message and Retry button (`refetch`).
- Invalid or out-of-range coordinates show a friendly error, not a crash.
- Show "Updated N min ago" using `dataUpdatedAt`; subtle indicator while background refetching (`isFetching`).
- Page title updates to the city name.

## Notes

- Depends on: weather-api-layer, city-search (both complete).
- Acceptance: visiting `/#/city/51.5/-0.12` shows live London data; loading, error and success states each render correctly.
- Tests: success renders all fields from MSW data; skeleton while pending; error with working Retry; invalid coordinates state.
- Spec: `context/features/current-conditions-spec.md`

## Completed Features

- **Project Setup:** TanStack Query client, hash router with layout and placeholder pages, CSS token styles, Vitest + MSW harness; see `src/router.tsx`, `src/api/queryClient.ts`, `src/test/`.
- **Weather API Layer:** Typed Open-Meteo geocoding/forecast clients, `ApiError`, weather code mapping, units store, `useCitySearch`/`useForecast` hooks; see `src/api/`, `src/hooks/`, `src/utils/weatherCodes.ts`.
- **City Search:** Debounced autocomplete `SearchBox` with keyboard support, combobox ARIA and clear button, navigating to the city route; see `src/components/SearchBox.tsx`, `src/hooks/useDebouncedValue.ts`.
