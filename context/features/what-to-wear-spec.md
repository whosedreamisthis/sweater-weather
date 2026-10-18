# What to Wear (the sweater feature)

Rule-based clothing suggestion on the City page.

**Depends on:** current-conditions, units-toggle

## Goals

- Pure function `getOutfit({ feelsLikeC, precipProbability, windKmh, uvIndex, isDay })` in `utils/outfit.ts` returning `{ summary, items[], tips[] }`. Always compute in °C/km/h internally (convert from the user's units).
- Example rules: ≤0 °C heavy coat, hat and gloves; 1–10 warm jacket; 11–17 sweater; 18–24 light layers; ≥25 light clothing; rain chance ≥40% umbrella/rain jacket; wind ≥30 km/h windbreaker; UV ≥6 sunscreen and sunglasses.
- `OutfitCard` on the City page with a short headline (e.g. "Bring a sweater") and a list of items.
- Use the next few hours' worst-case rain chance, not only the current hour.

## Acceptance Criteria

- Suggestions change sensibly with conditions and units don't affect the result.

## Tests

- Table-driven unit tests for threshold boundaries; component renders for a couple of scenarios.
