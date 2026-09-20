# Proposal

## Why

Emoji and other font glyphs can occupy different visual proportions inside the
same world cell. The Ascii Palette currently lets a developer change color,
but it does not let them correct a glyph's visible scale and preview that
correction before it is rendered in the game. A persisted per-glyph scale
override will make oversized or undersized glyphs diagnosable and correctable
from the existing palette editor.

## What Changes

- Add a per-glyph scale override to palette entries, defaulting to `100%`.
- Add scale decrease/increase controls to the selected glyph editor, with a
  live preview that uses the same bounded glyph-cell rendering behavior as the
  game world.
- Keep the color picker and scale controls together in the glyph editor, but
  position the editor so it does not cover the selected glyph's palette card.
- Apply a staged scale value only after Confirm; Cancel SHALL discard it.
- Persist confirmed scale values in the local palette JSON through the existing
  Vite persistence endpoint and preserve them when the palette is reloaded or
  migrated.
- Apply the confirmed scale at runtime without creating a separate cache entry
  for every color/opacity combination.
- Recommended unresolved control policy: use `10%` increments and clamp values
  to `25%` through `200%`. This is a recommendation for review, not an
  approved product decision.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `ascii-palette`: add staged per-glyph scale editing, live preview, confirm/
  cancel behavior, and disk/browser persistence for the scale value.
- `zoomed-glyph-rendering`: apply a confirmed per-glyph scale override inside
  the existing bounded raster/cache/rendering path while retaining shared cache
  behavior.

## Impact

- Palette model and migration/validation in
  `ascii-rpg/src/runtime/bridge-layer/palette.js`.
- Bundled palette data in
  `ascii-rpg/src/runtime/game-layer-babylon-lite/data/palette_data.json`.
- Glyph rasterization/cache and world-cell submission in
  `ascii-rpg/src/runtime/game-layer-babylon-lite/`.
- React Ascii Palette editor and its responsive window styles in
  `ascii-rpg/src/runtime/ui-layer-react/`.
- Existing Vite palette persistence remains the write boundary; no new
  dependency or external service is required.
- Focused palette, rendering, migration, persistence, and UI contract tests
  will need updates or additions.
