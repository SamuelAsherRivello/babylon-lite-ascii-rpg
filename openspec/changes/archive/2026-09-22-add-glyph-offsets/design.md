# Design

## Context

See `proposal.md` for motivation. The current application is a React/Vite browser RPG with a React Ascii Settings editor, a bridge-layer palette model, and a Babylon Lite renderer. Palette entries currently persist `color` and client-owned `alpha`; local development writes the complete palette JSON through the Vite palette endpoint, while deployed builds write the same palette payload to browser storage. The renderer builds glyph rasters in `glyph-visual-cache.js` and shares the world-view composition path between game view and mini-map.

Current glyph previews can drift from the client presentation if they paint their own preview background or tint path, so oversized emoji can appear plausible in the editor while being visibly misaligned or differently colored in the world.

## Goals / Non-Goals

**Goals:**

- Keep offsets as palette-entry style data so they travel through the existing local file, deployed storage, validation, and cross-instance notification paths.
- Make editor previews and client rendering use one offset-aware rasterization path.
- Keep offsets presentation-only: no world position, collision, fog, pickup, or actor state changes.
- Preserve the existing Confirm, Reset, Cancel, warning, and same-origin synchronization behavior.

**Non-Goals:**

- No separate global glyph-offset settings panel.
- No new asset pipeline or external UI dependency.
- No changes to actor movement, enemy AI, map generation, or glyph inventory beyond offset fields.
- No Playwright test files; verification should use existing Node/build checks plus manual browser inspection unless explicitly requested later.

## Decisions

### Store offsets on palette entries

Each palette entry should gain three integer fields, recommended names `offsetX`, `offsetY`, and `offsetScale`, with defaults of `0`.

Rationale: color edits already persist as complete palette snapshots and broadcast to same-origin instances. Offsets are per-glyph style data, so storing them beside `color` keeps local dev, deployed localStorage, validation, and reset semantics unified.

Alternative considered: a separate `glyph-offsets` localStorage key. That would split one glyph's editable style between two sources and would not update the checked-in palette JSON during local development.

### Centralize offset normalization in the bridge palette module

`createDefaultEntry`, `createPalette`, `validatePaletteEntries`, `serializePalette`, and customization detection should understand the new fields. Older palettes should be normalized by adding zero offsets before validation. Validation should require integers with `offsetX` and `offsetY` in `[-10, 10]` and `offsetScale` in `[-100, 100]`.

Rationale: the palette module is already the boundary that protects renderer and UI code from malformed persisted data.

Alternative considered: clamp invalid values during validation. Rejection is safer for corrupt stored palettes and matches the current validation stance for malformed colors and alpha.

### Reuse the client composite cell renderer in previews

`PaletteGlyph` should become an offset-aware cell preview component used by both palette cards and the color editor preview. The preview should call the same composite rasterization path as the game and mini-map, using the palette color, glyph background darkness, active font, and offset values. CSS should reserve stable square dimensions for the card and popup variants so large emoji do not resize the layout.

Rationale: the issue is a mismatch between visual contexts. A single preview component reduces drift between the table and popup.

Alternative considered: CSS-only white background behind the current canvas. That shows a square but does not guarantee the glyph is using the same background, tint, lighting, positioning, and scale as the world raster.

### Apply offsets in glyph rasterization, not gameplay coordinates

Extend the rasterization options accepted by `rasterizeGlyph` and `rasterizeCompositeGlyph` so the canvas draw call can translate by `offsetX`/`offsetY` pixels and scale by `1 + offsetScale / 100`. For facing variants, mirror and offset application should be deterministic and should still derive palette/color data from the base glyph identity.

Rationale: rasterization is the shared shape creation point for the sprite atlas and canvas previews. Keeping the offset inside raster generation preserves renderer cell centers, fog logic, and occupancy.

Alternative considered: moving sprite centers at render time. That would make sprite state and visible-region diffing more complex and would risk changing overlay and lighting relationships.

### Include offsets in visual cache identity and invalidation

When the renderer requests visual glyphs, the cache identity needs to distinguish entries whose glyph/facing/font/zoom are the same but whose offsets differ. The implementation can either encode normalized offsets into a cache key wrapper or extend the cache to accept a glyph-style lookup; in both cases the cache should still use the base glyph for palette color and facing semantics.

Palette updates should rebuild glyph caches whenever any confirmed offset changes. Pure color changes can keep the existing color-only fast path when glyph backgrounds are disabled; offset changes cannot, because they alter the raster shape.

Alternative considered: always rebuilding caches for any palette edit. That is simpler but would regress the existing palette-only update path for color-only edits.

## Risks / Trade-offs

- Offset scale `-100%` can make a glyph vanish by design -> keep the slider value visible and test the endpoint so this is intentional rather than a rendering error.
- Emoji metrics vary by platform font -> preview and client must share the active font path, but exact emoji artwork may still differ across browsers or operating systems.
- Cache key growth from offsets -> offsets are bounded integers, and only visible/requested glyphs are cached lazily.
- Existing dirty work touches rendering and minimap behavior -> implementation should inspect current diffs before editing and avoid reverting unrelated changes.

## Migration Plan

1. Backfill missing offsets to zero in palette creation before validation.
2. Bump the palette version and write the complete palette with offsets on the next successful local or deployed palette commit.
3. Client loading of old checked-in or localStorage palettes should produce entries with zero offsets and unchanged visible rendering.
4. Rollback is data-compatible if ignored offset fields remain in stored palettes; older code that strictly validates entries may reject extra fields, so normal rollback should restore the prior palette file format as part of reverting this change.
