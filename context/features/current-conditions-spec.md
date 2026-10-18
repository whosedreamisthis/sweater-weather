# Current Conditions

The City page hero card showing weather right now.

**Depends on:** weather-api-layer, city-search

## Goals

- `City` page reads `lat`/`lon` (and optional `name`) from the route and calls `useForecast`.
- `CurrentWeather` card: location name, large temperature, feels-like, condition icon and description, humidity, wind speed and direction, pressure, UV index, visibility.
- Day/night aware icon and accent styling from `is_day` and weather group.
- Skeleton loader matching the final card layout.
- Error state with message and Retry button (`refetch`).
- Invalid or out-of-range coordinates show a friendly error, not a crash.
- Show "Updated N min ago" using `dataUpdatedAt`; subtle indicator while background refetching (`isFetching`).
- Page title updates to the city name.

## Acceptance Criteria

- Visiting `/#/city/51.5/-0.12` shows live London data.
- Loading, error and success states each render correctly.

## Tests

- Success renders all fields from MSW data.
- Skeleton while pending; error with working Retry.
- Invalid coordinates state.
