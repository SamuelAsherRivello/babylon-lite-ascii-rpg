# Tasks

## 1. Palette Data Model

- [ ] 1.1 Add default `offsetX`, `offsetY`, and `offsetScale` fields to palette entries and verify `createDefaultPalette()` returns entries with zero offsets.
- [ ] 1.2 Update palette migration and validation to backfill missing offsets, reject invalid offset ranges, preserve existing color/alpha data, and verify focused palette tests pass.
- [ ] 1.3 Bump palette serialization/version data and update `palette_data.json` so every checked-in entry includes zero offsets, then verify `serializePalette()` emits the complete offset-bearing payload.
- [ ] 1.4 Update customization logic so nonzero offsets count as customized without breaking color-only customized filtering, then verify customized filtering covers color-only, offset-only, and default entries.

## 2. Ascii Settings UI

- [ ] 2.1 Refactor the palette glyph preview component to render a white square-backed grid-cell preview and verify both palette cards and the popup preview use the same component.
- [ ] 2.2 Add staged `Offset X`, `Offset Y`, and `Offset Scale` sliders to the color editor with the requested ranges and visible values, then verify opening a glyph shows committed values or zero defaults.
- [ ] 2.3 Extend Confirm, Reset, and Cancel handling so Confirm persists draft color and offsets, Reset stages default color plus zero offsets, and Cancel discards all draft changes; verify the existing UI contract tests cover the updated strings and behavior hooks.
- [ ] 2.4 Update CSS for the palette grid and editor popup so square-backed previews have stable dimensions, no nested card treatment, no text overflow, and no popup overflow in portrait or landscape layouts.

## 3. Runtime Rendering

- [ ] 3.1 Extend glyph rasterization to accept normalized offsets and scale, apply them within the glyph canvas, and verify focused raster tests cover zero offsets, translation, scale endpoints, and right-facing glyphs.
- [ ] 3.2 Pass palette offsets into game-view and mini-map glyph cache creation while keeping palette color lookup tied to base glyph identity, then verify player and enemy facing colors remain consistent.
- [ ] 3.3 Include offset values in glyph visual cache identity or invalidation so confirmed offset changes rebuild affected glyph visuals without regenerating world data, then verify rendering/cache tests cover offset-only palette updates.
- [ ] 3.4 Ensure mini-map canvas cache keys include offset-dependent raster identity where needed and verify minimap output updates after a confirmed offset edit.

## 4. Verification

- [ ] 4.1 Run focused Node tests for palette, UI contract, glyph raster/cache, and minimap rendering, and verify all focused tests pass.
- [ ] 4.2 Run `npm.cmd run build` from the repository root and verify the production build succeeds.
- [ ] 4.3 Manually open the local Vite app, inspect the fencer glyph in the world, palette grid, and color editor popup, and verify all three show the glyph on a consistent grid-cell square with matching offset/scale behavior.
- [ ] 4.4 Run `openspec validate add-glyph-offsets --strict` and verify the proposal, specs, design, and tasks are valid.
