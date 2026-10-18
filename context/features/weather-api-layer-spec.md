# Weather API Layer

Typed Open-Meteo clients and TanStack Query hooks. No UI beyond a temporary debug render.

**Depends on:** project-setup

## Goals

- Define types in `src/api/types.ts`: `Units`, `Location`, `CurrentWeather`, `HourlyPoint`, `DailyPoint`, `Forecast` (see Data Model in the overview).
- `api/geocoding.ts`: `searchCities(query)` calling the Open-Meteo geocoding endpoint; returns `Location[]` (empty array when no results).
- `api/weather.ts`: `fetchForecast(lat, lon, units)` calling the forecast endpoint once for current + hourly + daily, with `timezone=auto`.
- Transform column-oriented responses into row-oriented objects inside `api/` so components never see raw shape.
- Throw a typed `ApiError` on non-2xx responses and on network failure.
- `utils/weatherCodes.ts`: map WMO codes to `{ description, icon, group }` with day/night variants.
- Hooks: `useCitySearch(query)` (enabled when query ≥ 2 chars, `staleTime` 1 hr) and `useForecast(lat, lon)` (key `['weather', lat, lon, units]`, reads units from the store).
- Minimal Zustand store with `units` only (full store comes in the units-toggle feature).

## Technical Notes

- Verify current Open-Meteo parameter and variable names against the docs before coding.
- Validate lat/lon ranges before requesting; invalid input is an error state, not a request.

## Acceptance Criteria

- Hooks return correctly shaped data against real Open-Meteo.
- Errors surface through `isError` with a useful message.

## Tests

- MSW handlers in `src/test/handlers.ts` for both endpoints.
- Unit tests for the response transformers, `weatherCodes`, and error handling.
- Hook tests via `renderHook` with a query client wrapper (success, error, disabled).
