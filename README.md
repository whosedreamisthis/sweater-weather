# SweaterWeather

A clean, fast weather app that answers "What's it like out, and what should I wear?"

Live: https://whosedreamisthis.github.io/sweater-weather/

## Features

- **Home:** hero with city search and a "Use my location" button, your saved locations with live weather, a grid of popular cities and a short how-it-works guide.
- **City search:** debounced autocomplete with full keyboard support.
- **Current conditions:** temperature, feels-like, humidity, wind, pressure, UV and visibility, with day/night and weather-tinted styling.
- **Forecasts:** next 24 hours (hourly strip) and 7 days (expandable rows with sunrise, sunset and UV).
- **What to wear:** rule-based outfit suggestion from feels-like temperature, rain chance, wind and UV.
- **Air quality:** US AQI with category, health note and PM2.5/PM10.
- **Saved locations:** up to 10 favorites, stored in your browser.
- **Units:** °C/°F, km/h or mph, mm or inches, defaulting by locale and remembered between visits.

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
