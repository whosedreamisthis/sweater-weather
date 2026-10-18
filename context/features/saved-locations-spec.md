# Saved Locations

Favorite cities with quick switching, persisted locally.

**Depends on:** current-conditions, units-toggle (persist setup)

## Goals

- Store: `favorites: Location[]`, `addFavorite`, `removeFavorite`, `isFavorite` selector; persisted.
- Favorite (star) button on the City page toggles the current location.
- Home page lists favorite cards, each showing the city name and a compact current temperature + icon (one `useForecast` per card; cached and deduped by TanStack Query).
- Remove button on each card; empty state with guidance when no favorites.
- Dedupe by coordinates; cap at 10 with a friendly message.
- Per-card loading and error states (one failing card doesn't break the list).

## Acceptance Criteria

- Favorites persist across reloads and open the right city on click.

## Tests

- Store add/remove/dedupe/cap.
- Home renders cards, empty state, and a failing card in isolation.
