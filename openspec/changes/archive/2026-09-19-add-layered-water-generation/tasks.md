# Tasks

## 1. Refactor world generation into ordered passes

- [x] 1.1 Introduce a shared deterministic generation context and explicit ground, cave/walls, water, walkability, and player-position pass boundaries; verify the existing seeded cave tests still reproduce the same dimensions and resolved seed behavior where the new water options are disabled or at their defaults.
- [x] 1.2 Move the existing bordered cellular-automata cave generation into the cave/walls pass while preserving wall-fill, smoothing, minimum-region validation, and outer-border behavior; verify focused world-system tests cover the configured cave parameters.
- [x] 1.3 Keep terrain and character layers separate while making terrain cells retain terrain kind/depth metadata; verify player and torch character precedence tests still pass without rewriting underlying terrain.

## 2. Add deterministic organic water generation

- [x] 2.1 Add water-generation parameters with a default target near 20% of post-cave interior non-wall ground and validate their ranges; verify invalid values produce focused range errors and valid values are retained in world options.
- [x] 2.2 Implement seeded independent organic lakes, each targeting 5-20 cells, that claim only eligible ground cells and assign nested shallow, medium, and deep bands; verify identical seeds reproduce positions and depth glyphs and default worlds meet the documented aggregate coverage tolerance.
- [x] 2.3 Derive final walkability after water, preserve connected ordinary-ground/shallow-water regions, and retry or reject unsuitable masks within the bounded generation behavior; verify medium/deep water block movement while shallow water permits movement.
- [x] 2.4 Place the player only after final walkability validation and ensure the start is ordinary ground or shallow water; verify no generated player start is a wall, medium water, or deep water.

## 3. Integrate water rendering and palette defaults

- [x] 3.1 Add `~`, `≈`, and `▓` to the Babylon Lite atlas/rendering path and ensure terrain glyph lookup renders them through the active palette; verify empty character cells show the expected water glyph.
- [x] 3.2 Add default light-blue, medium-blue, and dark-blue styles for the three water glyphs while preserving user palette overrides and map-glyph filtering; verify palette tests and local/deployed palette persistence behavior remain valid.
- [x] 3.3 Integrate the new terrain contract with the in-flight torch placement behavior without changing torch count, placement, or character precedence; verify torch tests pass on worlds containing water.

## 4. Verify the complete change

- [x] 4.1 Extend world-system tests for pass ordering, deterministic layers, approximate aggregate coverage, 5-20-cell lakes, nested depth bands, walkability, player safety, and resize-seed stability; verify the focused Node test file passes.
- [x] 4.2 Run the repository's existing Node test suite and production build from the repository root; verify both complete successfully without adding or running Playwright tests.
- [x] 4.3 Manually inspect a seeded browser level at the actual nested Vite app URL and after resize; verify small organic lakes are visibly blue in three shades, the player can enter shallow water, and deeper water stops movement.
