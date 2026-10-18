# Coding Standards

Stack: Vite, React, TypeScript, TanStack Query, Zustand, React Router (hash), CSS Modules, Vitest + React Testing Library + MSW.

## TypeScript

- Strict mode enabled
- No `any` types - use proper typing or `unknown`
- Define types for all props, API responses, and data models
- Use type inference where obvious, explicit types where helpful
- Use `import type` for type-only imports (`verbatimModuleSyntax` is on)
- No enums (`erasableSyntaxOnly`): use string unions or `as const` objects

## React

- Functional components only (no class components)
- Use hooks for state and side effects
- Keep components focused - one job per component
- Extract reusable logic into custom hooks in `src/hooks/`
- Components are presentational: no `fetch` calls inside components
- Prefer derived values over `useEffect` + `useState` syncing

## State

- **Server state** (weather, geocoding) lives only in TanStack Query. Never copy query data into Zustand or component state
- **Client state** (units, favorites, theme) lives in Zustand, persisted with the `persist` middleware
- **Shareable state** (selected city) lives in the URL
- Select the smallest slice from a Zustand store (`useStore(s => s.units)`), never the whole store
- Wrap `localStorage` access in try/catch; the app must work without it

## Data Fetching

- API functions live in `src/api/`, one file per external API; they return typed, row-oriented objects (transform Open-Meteo's column arrays there)
- Throw a typed `ApiError` (with numeric `status`) on non-2xx responses and network failure
- Wrap each query in a hook in `src/hooks/` (`useForecast`, `useCitySearch`); components consume the hook, not `useQuery` directly
- Query keys are arrays starting with the resource name and include every input, e.g. `['weather', lat, lon, units]`
- Every data-driven component handles loading (skeleton), error (message + Retry) and empty states
- Validate coordinates and user input before making a request

## Routing

- Use `createHashRouter` (GitHub Pages has no server rewrites)
- Routes are defined in `src/router.tsx`; page components live in `src/pages/`
- Import `RouterProvider` from `react-router/dom`, everything else from `react-router`
- Invalid route params render an error state, never crash

## Styling

- CSS Modules for all component styling: `ComponentName.module.css` next to the component
- Global tokens (colors, spacing, radius, font) are CSS custom properties in `src/index.css`; use `var(--token)`, no hardcoded colors or spacing in modules
- Theme switching via `data-theme` on `<html>` overriding the tokens
- No inline styles except truly dynamic values (e.g. a computed bar width)
- Mobile first: base styles for small screens, `min-width` media queries for larger
- Use semantic HTML and meet WCAG AA contrast in both themes

## Accessibility

- Every input has a label; icon-only buttons have `aria-label`
- Keyboard operable; visible focus styles
- Loading and error updates announced with `aria-live`
- Never convey information by color or icon alone

## File Organization

- Components: `src/components/[feature]/ComponentName.tsx` + `.module.css` (shared shell pieces may sit directly in `components/`)
- Pages: `src/pages/PageName.tsx`
- Hooks: `src/hooks/useThing.ts`
- API clients and types: `src/api/`
- Zustand store: `src/store/`
- Pure helpers: `src/utils/`
- Test helpers, MSW handlers and setup: `src/test/`

## Naming

- Components: PascalCase (`HourlyList.tsx`)
- Hooks: `useCamelCase`
- Other files: camelCase (`weatherCodes.ts`)
- Functions: camelCase
- Constants: SCREAMING_SNAKE_CASE
- Types: PascalCase (no `I` or `T` prefix)
- CSS Module classes: camelCase (`styles.cardTitle`)

## Testing

- **Vitest + React Testing Library + MSW**: `npm test` runs once, `npm run test:watch` watches
- Test files sit next to the code: `*.test.ts` / `*.test.tsx`
- Globals (`describe`, `it`, `expect`, `vi`) are enabled; do not import them
- Test behavior as the user sees it: query by role, label or text, not class names or implementation details
- Use `userEvent` for interactions; `await` async UI with `findBy*` / `waitFor`
- Render with `renderWithProviders` (fresh `QueryClient`, `retry: false`, `MemoryRouter`)
- Never hit the real network: mock Open-Meteo with MSW handlers in `src/test/handlers.ts` (unhandled requests fail the test)
- Mock browser APIs (`navigator.geolocation`, `matchMedia`, `localStorage`) per test
- Always cover loading, error and success for data-driven components
- Unit-test pure utilities (unit conversion, weather-code mapping, outfit rules) with table-driven cases
- Cover the happy path and error cases; don't write tests just to write them

## Error Handling

- Surface errors through query state (`isError`, `error`) and show a user-friendly message with Retry
- Never show raw error objects or stack traces to users
- Handle geolocation denial, unsupported browsers and empty search results explicitly

## Code Quality

- No commented-out code unless specified
- No unused imports or variables
- Keep functions under 50 lines when possible
- `npm run lint`, `npm test` and `npm run build` must pass before a feature is complete
