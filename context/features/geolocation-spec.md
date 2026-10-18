# Geolocation

"Use my location" button.

**Depends on:** current-conditions

## Goals

- `useGeolocation` hook wrapping `navigator.geolocation.getCurrentPosition` with states: idle, loading, success, denied, unavailable, timeout.
- "Use my location" button on Home and in the search box; on success navigate to `/city/:lat/:lon` (name resolved via reverse geocoding if available, else "Current location").
- Distinct, friendly messages for permission denied, unsupported browsers and timeouts, with a prompt to search manually.
- Never request permission on page load, only on click.
- Round coordinates (e.g. 2 decimals) for better query cache hits and privacy.

## Acceptance Criteria

- Allowing permission opens the local forecast; denying shows a message and the app stays usable.

## Tests

- Mock `navigator.geolocation` for success, denied and unsupported cases; assert navigation and messages.
