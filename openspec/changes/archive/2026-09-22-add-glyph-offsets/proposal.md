# Proposal

## Why

Emoji glyphs such as the fencer render with a different apparent footprint in the world than in the Ascii Settings grid and color editor, so the editor does not accurately preview glyph size or alignment against the game grid. Developers need per-glyph positioning and scale controls so oversized or off-center glyphs can be tuned once and rendered consistently everywhere.

## What Changes

- Render each glyph preview in the Ascii Settings glyph grid through the same composite grid-cell rendering path used by the game and mini-map, including the glyph background, glyph tint, offsets, and default lighting treatment.
- Render the color picker popup preview with the same shared composite grid-cell renderer, so the table preview, popup preview, world view, and mini-map communicate the same relationship between glyph and cell.
- Add three staged sliders to the color picker popup:
  - `Offset X`, constrained to integer values from `-10` through `10`, default `0`.
  - `Offset Y`, constrained to integer values from `-10` through `10`, default `0`.
  - `Offset Scale`, constrained to integer percentage values from `-100%` through `100%`, default `0%`.
- Persist the confirmed offsets with the palette entry alongside the existing color data, with older palettes backfilled to `0` offsets.
- Apply confirmed offsets to game-view and minimap glyph rasterization without changing world grid occupancy, collision, fog eligibility, palette identity, or actor facing identity.
- Preserve the existing Confirm, Reset, and Cancel behavior: Confirm saves staged color and offsets, Reset returns the selected glyph draft to default color and zero offsets, and Cancel discards the draft.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `ascii-palette`: Adds editable, persisted per-glyph offset controls and grid-cell-accurate glyph previews in the Ascii Settings glyph grid and color editor.
- `world-view-rendering`: Requires game-view and minimap world rendering to apply the confirmed glyph offsets consistently while preserving shared glyph identity, fog, lighting, and facing behavior.
- `zoomed-glyph-rendering`: Extends the cached glyph visual contract so glyph offset and scale changes are reflected as part of glyph visual reuse and invalidation across supported zoom levels.

## Impact

- Affects the React Ascii Settings palette editor in `ascii-rpg/src/client/ui-layer-react/App.jsx` and its window styles.
- Affects palette modeling, validation, migration, serialization, and persistence in the bridge and UI palette store.
- Affects Babylon Lite glyph rasterization and cache keys in `glyph-visual-cache.js` and client consumers in the world/minimap render path.
- Requires focused Node tests for palette defaults/migration/validation, UI contract checks, and glyph raster/cache behavior. Manual browser verification should compare the world cell, glyph grid card, and color editor preview for the same glyph.
- Adds no new client dependency.
