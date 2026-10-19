# Current Feature

<!-- Feature name and short description -->

## Status

<!-- Not Started | In Progress | Complete -->

Completed

## Goals

<!-- Goals and requirements -->

## Notes

<!-- Any extra notes -->

## Completed Features

- **Project Setup:** TanStack Query client, hash router with layout and placeholder pages, CSS token styles, Vitest + MSW harness; see `src/router.tsx`, `src/api/queryClient.ts`, `src/test/`.
- **Weather API Layer:** Typed Open-Meteo geocoding/forecast clients, `ApiError`, weather code mapping, units store, `useCitySearch`/`useForecast` hooks; see `src/api/`, `src/hooks/`, `src/utils/weatherCodes.ts`.
- **City Search:** Debounced autocomplete `SearchBox` with keyboard support, combobox ARIA and clear button, navigating to the city route; see `src/components/SearchBox.tsx`, `src/hooks/useDebouncedValue.ts`.
- **Current Conditions:** City page hero card with skeleton, error/Retry, invalid-coordinate state and day/night accents; see `src/pages/City.tsx`, `src/components/current/`, `src/utils/format.ts`.
- **Units Toggle:** Persisted units store with `en-US` defaults, header °C/°F toggle, segmented Settings controls and a cloud logo/favicon; see `src/store/useAppStore.ts`, `src/components/UnitToggle.tsx`, `src/pages/Settings.tsx`.
- **Hourly Forecast:** City page strip of the next 24 hours from the current hour, with Now label, units-aware temps and snap scrolling; see `src/components/hourly/`, `src/utils/hourly.ts`.
