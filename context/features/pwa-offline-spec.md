# PWA / Offline

**Depends on:** all MVP features

## Goals

- Add `vite-plugin-pwa` with a manifest (name, icons, theme color, `start_url` and `scope` of `/sweater-weather/`).
- Precache the app shell; runtime caching for API responses is handled by persisting the TanStack Query cache (`@tanstack/query-persist-client-core` + localStorage/IDB persister).
- Show last-known data when offline with an "Offline — showing saved data from N min ago" banner.
- Update prompt when a new version is available.

## Acceptance Criteria

- App installs on mobile/desktop, loads offline, and shows cached favorites/forecast.

## Tests

- Offline banner logic (mock `navigator.onLine`); manual install/offline check on the deployed site.
