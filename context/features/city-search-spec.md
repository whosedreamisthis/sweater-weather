# City Search

Search box with autocomplete that navigates to a city's forecast.

**Depends on:** weather-api-layer

## Goals

- `SearchBox` component in the header and on Home, using `useCitySearch`.
- Debounce input (~300 ms) via a small `useDebouncedValue` hook.
- Dropdown of up to 5 results showing name, region and country.
- Selecting a result navigates to `/city/:lat/:lon` (pass name via query string, e.g. `?name=London`).
- States: loading indicator, error with retry, "No cities found" empty state, nothing shown for queries under 2 characters.
- Keyboard support: arrow keys, Enter to select, Escape to close.
- Accessible combobox pattern: `role="combobox"`, `aria-expanded`, `aria-controls`, `aria-activedescendant`, labelled input, `aria-live` status for result count.
- Clear button; close the dropdown on outside click.

## Acceptance Criteria

- Typing "lond" lists London results; selecting one opens the city route.
- Fully usable with keyboard only.

## Tests

- Typing shows debounced results (MSW), selecting navigates.
- Empty, error and loading states render.
- Keyboard navigation and Escape behavior.
