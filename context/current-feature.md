# Current Feature: Weather API Layer

Typed Open-Meteo clients and TanStack Query hooks. No UI beyond a temporary debug render.

## Status

In Progress

## Goals

- Define types in `src/api/types.ts`: `Units`, `Location`, `CurrentWeather`, `HourlyPoint`, `DailyPoint`, `Forecast` (see Data Model in the overview).
- `api/geocoding.ts`: `searchCities(query)` calling the Open-Meteo geocoding endpoint; returns `Location[]` (empty array when no results).
- `api/weather.ts`: `fetchForecast(lat, lon, units)` calling the forecast endpoint once for current + hourly + daily, with `timezone=auto`.
- Transform column-oriented responses into row-oriented objects inside `api/` so components never see raw shape.
- Throw a typed `ApiError` on non-2xx responses and on network failure.
- `utils/weatherCodes.ts`: map WMO codes to `{ description, icon, group }` with day/night variants.
- Hooks: `useCitySearch(query)` (enabled when query ≥ 2 chars, `staleTime` 1 hr) and `useForecast(lat, lon)` (key `['weather', lat, lon, units]`, reads units from the store).
- Minimal Zustand store with `units` only (full store comes in the units-toggle feature).

## Notes

- Depends on: project-setup.
- Verify current Open-Meteo parameter and variable names against the docs before coding.
- Validate lat/lon ranges before requesting; invalid input is an error state, not a request.
- Acceptance: hooks return correctly shaped data against real Open-Meteo; errors surface through `isError` with a useful message.
- Tests: MSW handlers in `src/test/handlers.ts` for both endpoints; unit tests for response transformers, `weatherCodes`, and error handling; hook tests via `renderHook` with a query client wrapper (success, error, disabled).

## Completed Features

- **Project Setup:** TanStack Query client, hash router with layout and placeholder pages, CSS token styles, Vitest + MSW harness; see `src/router.tsx`, `src/api/queryClient.ts`, `src/test/`.
