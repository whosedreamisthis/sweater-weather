# Air Quality

**Depends on:** current-conditions

## Goals

- `api/airQuality.ts` using the Open-Meteo Air Quality API (US or European AQI, PM2.5, PM10) and a `useAirQuality(lat, lon)` hook.
- `AirQualityCard` with AQI value, category label (Good…Hazardous), color-coded indicator (not color alone) and brief health note.
- Independent loading/error states so a failure here doesn't affect the rest of the page.

## Technical Notes

- Verify endpoint and variable names in the docs before implementing.
- Region coverage varies; handle missing data with a friendly "not available" state.

## Tests

- AQI category mapping (unit), card states with MSW.
