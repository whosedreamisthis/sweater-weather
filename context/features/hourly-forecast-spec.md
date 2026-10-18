# Hourly Forecast

Horizontally scrolling hourly strip on the City page.

**Depends on:** current-conditions

## Goals

- `HourlyList` showing the next 24 hours from the current hour (not from midnight), reusing the same `useForecast` query.
- Each item: time (local to the location's timezone), icon, temperature, precipitation probability.
- Highlight "Now" for the first item.
- Horizontal scroll with snap; keyboard-focusable and scrollable.
- Loading skeleton and error states consistent with Current Conditions (share the query state; don't refetch).
- Respect the units store (temperature) and the 12/24-hour locale default.

## Technical Notes

- Slice by timestamp relative to `current.time`, using the location timezone returned by the API.

## Acceptance Criteria

- Exactly 24 items starting at the current hour; times match the city's local time.

## Tests

- Slicing logic unit test (including day rollover).
- Renders items, "Now" label, and units-aware temperatures.
