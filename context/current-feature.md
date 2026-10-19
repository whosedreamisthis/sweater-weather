# Current Feature: Geolocation

"Use my location" button.

## Status

In Progress

## Goals

- `useGeolocation` hook wrapping `navigator.geolocation.getCurrentPosition` with states: idle, loading, success, denied, unavailable, timeout.
- "Use my location" button on Home and in the search box; on success navigate to `/city/:lat/:lon` (name resolved via reverse geocoding if available, else "Current location").
- Distinct, friendly messages for permission denied, unsupported browsers and timeouts, with a prompt to search manually.
- Never request permission on page load, only on click.
- Round coordinates (e.g. 2 decimals) for better query cache hits and privacy.

## Notes

- Depends on: current-conditions.
- Acceptance: allowing permission opens the local forecast; denying shows a message and the app stays usable.
- Tests: mock `navigator.geolocation` for success, denied and unsupported cases; assert navigation and messages.

## Completed Features

- **Project Setup:** TanStack Query client, hash router with layout and placeholder pages, CSS token styles, Vitest + MSW harness; see `src/router.tsx`, `src/api/queryClient.ts`, `src/test/`.
- **Weather API Layer:** Typed Open-Meteo geocoding/forecast clients, `ApiError`, weather code mapping, units store, `useCitySearch`/`useForecast` hooks; see `src/api/`, `src/hooks/`, `src/utils/weatherCodes.ts`.
- **City Search:** Debounced autocomplete `SearchBox` with keyboard support, combobox ARIA and clear button, navigating to the city route; see `src/components/SearchBox.tsx`, `src/hooks/useDebouncedValue.ts`.
- **Current Conditions:** City page hero card with skeleton, error/Retry, invalid-coordinate state and day/night accents; see `src/pages/City.tsx`, `src/components/current/`, `src/utils/format.ts`.
- **Units Toggle:** Persisted units store with `en-US` defaults, header °C/°F toggle, segmented Settings controls and a cloud logo/favicon; see `src/store/useAppStore.ts`, `src/components/UnitToggle.tsx`, `src/pages/Settings.tsx`.
- **Hourly Forecast:** City page strip of the next 24 hours from the current hour, with Now label, units-aware temps and snap scrolling; see `src/components/hourly/`, `src/utils/hourly.ts`.
- **Daily Forecast:** City page 7-day list with weekday, icon, condition, rain chance and low–high, expandable sunrise/sunset/UV; see `src/components/daily/`, `src/utils/daily.ts`.
- **Saved Locations:** Persisted favorites (deduped by coordinates, capped at 10) with a City page save button and Home cards with per-card weather; see `src/store/useAppStore.ts`, `src/components/favorites/`.
