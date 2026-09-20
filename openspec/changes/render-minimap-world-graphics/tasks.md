# Tasks

## 1. World-graphics rendering

- [ ] 1.1 Replace grey aggregate minimap pixels with explicit world-background then world-glyph passes using the established world visuals and palette resolution; verify focused renderer tests cover terrain, water, and object colors.
- [ ] 1.2 Keep undiscovered cells hidden while adapting source cells to the existing fixed canvas and `[1, 5, 10]` minimap content zoom; verify viewport and fog tests cover all zoom levels.

## 2. Marker compositing

- [ ] 2.1 Split minimap rendering into world-background, world-glyph, and marker passes; verify overlapping terrain/start/torch/player cells preserve the required back-to-front marker order.
- [ ] 2.2 Confirm minimap clicks, persisted zoom, fixed canvas bounds, hidden zoom number, and game zoom isolation remain unchanged through focused bridge, UI, and manual browser checks.

## 3. Validation

- [ ] 3.1 Run the full Node test suite and production build from the repository root; confirm all focused minimap tests pass.
- [ ] 3.2 Manually inspect the local browser preview at each minimap zoom and after refresh, confirming actual world graphics render beneath visible markers without changing the minimap footprint or game zoom display; do not create or run Playwright tests.
