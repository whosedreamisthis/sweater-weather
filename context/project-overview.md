# 📖 SweaterWeather — Project Overview

---

## Table of Contents

1. [Problem](#1-problem)
2. [Target Users](#2-target-users)
3. [Features](#3-features)
4. [Tech Stack](#4-tech-stack)
5. [Architecture](#5-architecture)
6. [Data Model](#6-data-model)
7. [API Reference](#7-api-reference)
8. [Routes](#8-routes)
9. [Monetization](#9-monetization)
10. [UI / UX](#10-ui--ux)
11. [Development Rules](#11-development-rules)
12. [Open Questions](#12-open-questions)
13. [Reference Links](#13-reference-links)

---

## 1. Problem

Most weather apps are cluttered, ad-heavy, or show raw numbers without telling you what to do with them. SweaterWeather is a clean, fast weather app that answers the everyday question: **"What's it like out, and what should I wear?"**

## 2. Target Users

- Commuters and everyday users who check the weather before leaving the house.
- Travelers comparing conditions across several cities.
- Anyone who wants a quick glance at current conditions and a short forecast without ads or sign-ups.

---

## 3. Features

### MVP

- **City search** with autocomplete (geocoding), debounced input.
- **Current conditions**: temperature, feels-like, condition icon and description, humidity, wind speed and direction, pressure, UV index, visibility.
- **Hourly forecast** for the next 24–48 hours.
- **7-day daily forecast** with high/low, precipitation chance and condition.
- **Saved locations (favorites)**: add, remove, and switch between cities; persisted in `localStorage`.
- **Units toggle**: °C/°F, km/h/mph, mm/in; persisted.
- **Geolocation**: "Use my location" button with graceful permission-denied fallback.
- **Loading, error, and empty states** for every data view (skeletons, retry button, "no results").
- **Responsive layout** (mobile first) and light/dark theme.

### Nice-to-have

- **"What to wear" hint** (the sweater feature): simple rule-based suggestion from feels-like temp, rain chance, and wind.
- Sunrise/sunset and day length.
- Air quality index.
- Precipitation and temperature charts.
- Weather alerts/warnings (where the API supports it).
- Recent searches.
- PWA / offline last-known data.
- Shareable URLs per city.

### Out of Scope (for now)

- User accounts and server-side persistence.
- Push notifications.
- Radar maps.

---

## 4. Tech Stack

| Concern | Choice | Notes |
|---|---|---|
| Build tool | **Vite** | Fast dev server, ESM builds |
| UI | **React** | Function components and hooks |
| Language | **TypeScript** (strict) | Typed API responses and props |
| Data fetching | **TanStack Query** | Caching, deduping, background refetch, loading/error states, retries |
| Client state | **Zustand** | Units, saved locations, theme (with `persist` middleware) |
| Routing | **React Router** (`createHashRouter`) | URL-driven city selection; hash routing works on GitHub Pages without server rewrites |
| Deployment | **GitHub Pages** | Static build via GitHub Actions (see Deployment) |
| Weather API | **Open-Meteo** | Free, no API key, CORS-enabled, non-commercial use |
| Geocoding | **Open-Meteo Geocoding API** | City search → lat/lon |
| Unit/Component tests | **Vitest** + **React Testing Library** | `@testing-library/user-event`, `jest-dom` matchers |
| API mocking | **MSW** | Network-level mocks in tests |
| Linting | ESLint (already configured) | |
| Styling | **CSS Modules** | `*.module.css` per component; global tokens (colors, spacing) as CSS custom properties in `index.css` |

### Why these choices

- **Open-Meteo** needs no key, so there are no secrets to hide and no backend is required. Alternatives: OpenWeatherMap (key required, free tier limits), WeatherAPI.com (key required).
- **TanStack Query** owns *server state* (weather and geocoding data). It handles caching, staleness, retries, and `isPending`/`isError` states, so we never hand-roll fetch effects.
- **Zustand** owns *client state* only. It is less boilerplate than Context plus a reducer and avoids needless re-renders via selectors.
- **CSS Modules** give locally scoped class names with no runtime cost and no extra dependency (supported by Vite out of the box). Theming uses CSS custom properties toggled by a `data-theme` attribute.
- **GitHub Pages** hosts static files only, so the app must be a pure client-side build. Open-Meteo needs no key, so nothing secret is shipped. Hash routing avoids 404s on refresh or deep links.
- **Rule of thumb:** server data → TanStack Query; UI/user preferences → Zustand; shareable state (selected city) → URL via React Router.

---

## 5. Architecture

```
src/
  api/            # fetch functions + response types (weather.ts, geocoding.ts)
  hooks/          # useWeather, useForecast, useCitySearch, useGeolocation (TanStack Query wrappers)
  store/          # Zustand store: units, favorites, theme
  components/     # presentational components (CurrentWeather, HourlyList, DailyList, SearchBox, ...)
  pages/          # route components (Home, City, NotFound)
  utils/          # unit conversion, formatters, weather-code → icon/description map, outfit rules
  test/           # setup file, MSW handlers, test utilities (render with providers)
  App.tsx         # providers (QueryClientProvider, RouterProvider)
  main.tsx
```

### Data flow

1. User searches a city → `useCitySearch(query)` (debounced) calls the geocoding API.
2. User selects a result → navigate to `/city/:lat/:lon` (name passed in the query string or looked up).
3. `useWeather(lat, lon)` fetches current + hourly + daily in a **single** Open-Meteo request.
4. Components render from query state: `isPending` → skeleton, `isError` → error with retry, `data` → UI.
5. Unit preferences from the store are applied at the request level (Open-Meteo unit params) or in a selector, not duplicated in components.

### TanStack Query defaults

- `staleTime`: ~5 min for weather, ~1 hr for geocoding.
- `gcTime`: default or higher for favorites.
- `retry`: 2, with no retry on 4xx.
- `refetchOnWindowFocus`: on (keeps data fresh).
- Query keys: `['weather', lat, lon, units]`, `['geocode', query]`.

---

## 6. Data Model

No database. All types live in `src/api/types.ts`.

```ts
type Units = {
  temperature: 'celsius' | 'fahrenheit';
  wind: 'kmh' | 'mph';
  precipitation: 'mm' | 'inch';
};

type Location = {
  id: number;
  name: string;
  country: string;
  admin1?: string;
  latitude: number;
  longitude: number;
  timezone: string;
};

type CurrentWeather = {
  time: string;
  temperature: number;
  apparentTemperature: number;
  weatherCode: number;
  isDay: boolean;
  humidity: number;
  windSpeed: number;
  windDirection: number;
  pressure: number;
};

type HourlyPoint = {
  time: string;
  temperature: number;
  precipitationProbability: number;
  weatherCode: number;
};

type DailyPoint = {
  date: string;
  tempMax: number;
  tempMin: number;
  precipitationProbabilitySum: number;
  weatherCode: number;
  sunrise: string;
  sunset: string;
  uvIndexMax: number;
};

type Forecast = {
  location: Location;
  current: CurrentWeather;
  hourly: HourlyPoint[];
  daily: DailyPoint[];
};
```

### Persisted client state (localStorage via Zustand `persist`)

```ts
type AppState = {
  units: Units;
  favorites: Location[];
  theme: 'light' | 'dark' | 'system';
  setUnits: (u: Partial<Units>) => void;
  addFavorite: (l: Location) => void;
  removeFavorite: (id: number) => void;
  setTheme: (t: AppState['theme']) => void;
};
```

---

## 7. API Reference

Both endpoints are free and keyless.

**Geocoding**

```
GET https://geocoding-api.open-meteo.com/v1/search?name={query}&count=5&language=en&format=json
```

**Forecast**

```
GET https://api.open-meteo.com/v1/forecast
  ?latitude={lat}&longitude={lon}
  &current=temperature_2m,apparent_temperature,relative_humidity_2m,is_day,weather_code,wind_speed_10m,wind_direction_10m,surface_pressure
  &hourly=temperature_2m,precipitation_probability,weather_code
  &daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,sunrise,sunset,uv_index_max
  &temperature_unit={celsius|fahrenheit}
  &wind_speed_unit={kmh|mph}
  &precipitation_unit={mm|inch}
  &timezone=auto
```

Notes:

- Weather codes follow WMO; map them to icon and description in `utils/weatherCodes.ts`.
- Responses are column-oriented arrays (`hourly.time[]`, `hourly.temperature_2m[]`); transform to row-oriented objects in the `api/` layer so components never see raw shape.
- Validate/parse responses at the boundary (e.g. Zod) if stricter safety is wanted.
- Verify current parameter names with the Open-Meteo docs before implementing.

---

## 8. Routes

| Path | Page | Purpose |
|---|---|---|
| `/` | Home | Search box, favorites list, "use my location" |
| `/city/:lat/:lon` | City | Current, hourly, and daily forecast for a location |
| `/settings` | Settings | Units and theme (could instead be a popover) |
| `*` | NotFound | 404 with link home |

- Use React Router's data router with `createHashRouter` (URLs look like `/#/city/51.5/-0.12`) and a shared layout route with header and search. Hash routing is chosen for GitHub Pages compatibility.
- Invalid coordinates in the URL → error state, not a crash.

---

## 9. Monetization

None. This is a personal/learning project. Note that Open-Meteo's free tier is for **non-commercial** use; revisit the API choice (or its paid plan) before any monetization.

---

## 10. UI / UX

- **Mobile first**, responsive up to desktop.
- **Layout**: header with search → hero card (current conditions) → hourly horizontal scroller → 7-day list.
- **Dynamic visuals**: background or accent changes with condition and day/night.
- **States**: skeleton loaders matching final layout, friendly error messages with Retry, empty state for no search results, and a distinct message for denied geolocation.
- **Accessibility**: semantic HTML, labelled inputs, combobox pattern for search autocomplete, keyboard navigation, sufficient contrast, `aria-live` for loading/error updates, and no information conveyed by icon alone.
- **Theme**: light/dark following system preference by default.

---

## 11. Development Rules

- Follow `context/coding-standards.md` and `context/ai-interaction.md`.
- TypeScript strict; no `any`.
- Server state only in TanStack Query; never copy query data into Zustand/Context.
- Components are presentational; data access goes through hooks in `src/hooks`.
- No fetch calls inside components.
- **Testing** (Vitest + React Testing Library):
  - Test behavior as the user sees it (queries by role/label/text), not implementation details.
  - Mock the network with MSW; create a fresh `QueryClient` per test with `retry: false`.
  - Unit-test pure utils (unit conversion, weather-code mapping, outfit rules).
  - Cover loading, error, and success states for each data-driven component.
  - Test store actions and persistence.
- Small, focused commits; one feature at a time (see `context/current-feature.md`).

---

### Deployment (GitHub Pages)

- Set `base: '/<repo-name>/'` in `vite.config.ts` (project sites are served from a subpath). Use `'/'` only for a `<user>.github.io` repo.
- Use `createHashRouter` so deep links and refreshes work without server rewrites.
- Deploy with a GitHub Actions workflow (`.github/workflows/deploy.yml`): on push to `main`, run `npm ci`, lint, tests, `npm run build`, then publish `dist/` with `actions/upload-pages-artifact` and `actions/deploy-pages`.
- In the repo settings, set Pages → Source to **GitHub Actions**.
- Reference static assets via Vite imports or `import.meta.env.BASE_URL`, never hardcoded absolute `/` paths.
- CI must pass tests before deploy.

---

## 12. Open Questions

- Include the "what to wear" feature in MVP or defer?
- Use Zod for response validation?
- Should the selected city live in the URL only, or also be remembered as "last viewed"?
- Repo name / Pages URL (project site at `/<repo>/` vs. user site at root) — determines the Vite `base`.

---

## 13. Reference Links

- Open-Meteo Forecast API: https://open-meteo.com/en/docs
- Open-Meteo Geocoding API: https://open-meteo.com/en/docs/geocoding-api
- WMO weather codes (see Open-Meteo docs, "WMO Weather interpretation codes")
- TanStack Query: https://tanstack.com/query/latest
- Zustand: https://zustand.docs.pmnd.rs
- Vite static deploy (GitHub Pages): https://vite.dev/guide/static-deploy.html#github-pages
- CSS Modules in Vite: https://vite.dev/guide/features.html#css-modules
- React Router: https://reactrouter.com
- Vitest: https://vitest.dev
- React Testing Library: https://testing-library.com/docs/react-testing-library/intro
- MSW: https://mswjs.io
