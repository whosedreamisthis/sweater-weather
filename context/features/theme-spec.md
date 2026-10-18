# Light / Dark Theme

**Depends on:** project-setup, units-toggle (persist setup)

## Goals

- Store: `theme: 'light' | 'dark' | 'system'`, `setTheme`; persisted.
- Apply via `data-theme` on `<html>`; `system` follows `prefers-color-scheme` and reacts to changes.
- Define light and dark values for every global CSS custom property.
- Toggle control in the header or settings.
- Avoid a flash of the wrong theme: small inline script in `index.html` sets `data-theme` before React loads.
- Ensure contrast meets WCAG AA in both themes.

## Acceptance Criteria

- Theme persists, follows the system preference by default, and no flash on load.

## Tests

- Store behavior; `data-theme` updates; system preference change handling (mock `matchMedia`).
