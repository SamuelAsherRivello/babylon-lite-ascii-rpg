# Proposal

## Why

The upper-left HUD currently has only a `Details` action, so players have no
visible readout of the character's initial survivability, combat stats,
experience, gold, or carrying state. A compact character information panel is
needed now to establish the data and visual contract before gameplay systems
begin updating those values.

## What Changes

- Add a `Character` panel inside the upper-left HUD box, preserving the
  existing square footprint and dimensions of the minimap box.
- Add a character data model containing starting and current health, offense,
  defense, experience, gold, and carrying values.
- Add one reusable UI bar component for health, offense, defense, and
  experience, with current, pending-change, and unfilled sections.
- Use only the stat glyph and bar for those four rows; do not render text labels
  such as `HEALTH` beside them.
- Pass a base color into every UI bar and derive its lighter delta color and
  darker-but-not-black unfilled color programmatically.
- Render the initial values as health 80%, offense 10%, defense 10%, and
  experience 0% with ordinal text `O1`.
- Render gold as `0` and carrying as `0/0` in the two left cells of a six-cell
  resource/slot grid, with four empty visual placeholders on the right.
- Represent all six visual icons as text glyphs in the DOM; do not add raster
  images, SVG drawings, or static icon assets.
- Keep value updates, leveling, inventory contents, pickups, and carrying logic
  out of this initial UI slice.

## Capabilities

### New Capabilities

- `character-info`: Defines the compact character information panel, its
  reusable UI bar contract, glyph-only icons, initial values, and fixed HUD
  geometry.

### Modified Capabilities

- None.

## Impact

- Affected UI: `ascii-rpg/src/runtime/ui-layer-react/App.jsx` and
  `ascii-rpg/src/runtime/ui-layer-react/style.css`.
- Affected model surface: a character data module under
  `ascii-rpg/src/runtime/ui-layer-react/`.
- Affected validation: focused static UI assertions, the existing Node test
  suite, and the Vite production build.
- No new runtime dependencies, asset files, persistence keys, or game-layer
  APIs are required for the initial state.
