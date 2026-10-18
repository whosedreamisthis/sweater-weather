# Units Toggle

User-selectable measurement units, persisted.

**Depends on:** current-conditions

## Goals

- Expand the Zustand store with `persist` middleware (localStorage key `sweater-weather`): `units`, `setUnits`.
- Settings page (or header popover) with controls for temperature (°C/°F), wind (km/h/mph) and precipitation (mm/in); a single quick °C/°F toggle in the header.
- Units are passed to Open-Meteo request params and included in the query key, so switching refetches in the right units (cached per unit set).
- Sensible default from `navigator.language` (°F/mph for `en-US`).
- Wrap localStorage access safely (try/catch) so the app works if storage is unavailable.

## Acceptance Criteria

- Changing units updates all displayed values and survives a reload.

## Tests

- Store actions and persistence (mock storage).
- Toggling updates displayed values via MSW responses per unit params.
