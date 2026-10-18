# Daily Forecast

7-day forecast list on the City page.

**Depends on:** current-conditions

## Goals

- `DailyList` with 7 rows: weekday ("Today" for the first), icon, condition, precipitation chance, low and high temperature.
- Temperature range bar scaled to the week's min and max.
- Show sunrise/sunset and max UV index for the selected day (expand a row or tap to reveal).
- Loading skeleton and error states shared with the page.
- Respect the units store.

## Acceptance Criteria

- Seven days render with correct weekday labels in the location's timezone.
- Range bars scale correctly across the week.

## Tests

- Weekday/"Today" labeling, range bar math (unit), row expand shows sunrise/sunset.
