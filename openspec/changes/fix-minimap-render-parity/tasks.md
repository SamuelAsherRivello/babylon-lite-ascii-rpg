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

## 4. Matching zoom pixel parity

- [x] 4.1 Replace minimap fill-to-canvas cell sizing with fixed-footprint placement derived from the shared game zoom/grid contract; keep player-centered crop bounds, fog suppression, and marker ordering intact.
- [x] 4.2 Add focused regression coverage for equal game/minimap zoom values, including zoom `1`, proving that cell spacing and glyph scale are not enlarged by the minimap canvas.
- [ ] 4.3 Run the Node suite and production build, then manually compare game/minimap screenshots at matching zooms `1`, `5`, and `10`; do not create or run Playwright tests.
