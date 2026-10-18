# Current Feature: Project Setup

Install the stack from `project-overview.md` and wire up providers, routing, styling foundations and the test harness. No weather features yet. Spec: `context/features/project-setup-spec.md`.

## Status

In Progress

## Goals

- Install `@tanstack/react-query`, `zustand`, `react-router`, and dev deps `vitest`, `jsdom`, `@testing-library/react`, `@testing-library/user-event`, `@testing-library/jest-dom`, `msw`.
- Add `QueryClientProvider` with defaults (`staleTime` 5 min, `retry` 2, no retry on 4xx).
- Add `createHashRouter` with a shared layout route (header placeholder + `<Outlet />`) and routes `/`, `/city/:lat/:lon`, `/settings`, `*` (placeholder pages).
- Create the folder structure from the Architecture section (`api/`, `hooks/`, `store/`, `components/`, `pages/`, `utils/`, `test/`).
- Replace the Vite starter styles with global CSS custom properties (colors, spacing, radius, font) in `index.css`, plus a CSS reset. Remove unused starter assets and `App.css`.
- Configure Vitest (jsdom, globals, setup file loading jest-dom and MSW server) and add `test` / `test:watch` scripts.
- Add `src/test/renderWithProviders.tsx` (fresh `QueryClient` with `retry: false`, `MemoryRouter`).
- Add `npm test` to the deploy workflow before the build step.

## Notes

- Components use `*.module.css`; add a `vite-env.d.ts` reference if CSS module typings are missing.
- Keep `base: '/sweater-weather/'`; hash router means no basename needed.
- Acceptance: `npm run dev` shows the layout with navigation between placeholder pages; `npm test`, `npm run lint`, `npm run build` all pass; a smoke test renders the app via `renderWithProviders`; deployed site still loads on GitHub Pages.
- Depends on: none (do first).

## Completed Features
