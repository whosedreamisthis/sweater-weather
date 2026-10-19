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
- **Daily Forecast:** City page 7-day list with weekday, icon, condition, rain chance and low–high, expandable sunrise/sunset/UV; see `src/components/daily/`, `src/utils/daily.ts`.
- **Saved Locations:** Persisted favorites (deduped by coordinates, capped at 10) with a City page save button and Home cards with per-card weather; see `src/store/useAppStore.ts`, `src/components/favorites/`.
- **Geolocation:** Click-only "Use my location" button beside search, rounded coordinates, reverse-geocoded city name and friendly error messages; see `src/hooks/useGeolocation.ts`, `src/components/UseMyLocationButton.tsx`.
- **Vibrant Colors:** Saturated palette tokens, gradient page background and header underline, weather-tinted current-conditions card; see `src/index.css`, `src/components/current/CurrentWeather.module.css`.
- **What to Wear:** Rule-based outfit card on the City page from feels-like, worst 6-hour rain chance, wind and UV; see `src/utils/outfit.ts`, `src/components/outfit/`.
- **Air Quality:** City page card with US AQI, category, health note and PM2.5/PM10, with its own loading/error/unavailable states; see `src/api/airQuality.ts`, `src/components/airquality/`.
- **Home Page Content:** Hero heading, popular cities grid with live weather and how-it-works strip below saved locations; city skeleton reserves save button space; see `src/components/home/`, `src/components/favorites/LocationWeather.tsx`.
