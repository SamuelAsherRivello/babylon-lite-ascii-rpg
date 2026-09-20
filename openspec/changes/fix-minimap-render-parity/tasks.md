# Tasks

## 1. Shared world composition

- [x] 1.1 Expose/reuse the game's rasterized glyph pixel source for minimap cells instead of canvas text; verify glyph pixels match the renderer's raster fixtures.
- [x] 1.2 Replace coarse one-glyph-per-region sampling with per-cell raster placement while preserving fog suppression; verify undiscovered cells stay blank.

## 2. Zoom and compositing

- [x] 2.1 Make minimap zoom `1` mirror the current game viewport and zooms `5`/`10` render player-centered crops of that same composition without changing canvas dimensions or game zoom; verify viewport tests.
- [x] 2.2 Enforce background → glyph → marker pass order and preserve marker depth behavior; verify overlap tests and crisp manual screenshots.

## 3. Validation

- [x] 3.1 Run the full Node test suite and production build; verify focused minimap parity tests pass.
- [x] 3.2 Manually compare the game view and minimap at zooms `1`, `5`, and `10`, including refresh persistence and crisp marker overlays; do not create or run Playwright tests.
