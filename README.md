# SweaterWeather

A clean, fast weather app that answers "What's it like out, and what should I wear?"

Live: https://whosedreamisthis.github.io/sweater-weather/

## Stack

React, Vite, TypeScript, TanStack Query, Zustand, React Router (hash), CSS Modules, Vitest + React Testing Library + MSW. Weather data from [Open-Meteo](https://open-meteo.com/) (no API key needed).

## Getting started

```bash
npm install
npm run dev
```

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Type-check and build for production |
| `npm run preview` | Preview the production build |
| `npm run lint` | Run ESLint |
| `npm test` | Run tests once |
| `npm run test:watch` | Run tests in watch mode |

## Deployment

Pushes to `main` run lint, tests and build, then deploy to GitHub Pages via `.github/workflows/deploy.yml`.

## Docs

Project plan, standards and feature specs live in [`context/`](context/) (start with `project-overview.md`).
