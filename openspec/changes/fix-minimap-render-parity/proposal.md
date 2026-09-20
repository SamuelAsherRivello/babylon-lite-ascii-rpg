# Proposal

## Why

The minimap still does not match the actual game view: it samples coarse regions and draws a tiny substitute glyph, while the game renders a full cell grid with its established glyph visuals. Players expect minimap view `1` to be the same world image as the game view, adapted only for scale and with navigation markers added.

## What Changes

- Render the same world-cell grid and glyph raster assets used by the game renderer into the minimap viewport.
- Make minimap view `1` a faithful miniature of the current game viewport and make views `5` and `10` progressively closer crops of that same composition.
- Preserve the game's actual cell footprint when mapping the minimap into its fixed canvas; matching game/minimap zoom values must not stretch cells to fill the minimap panel.
- Preserve world background first, world glyphs second, and markers last.
- Keep fog-of-war, fixed minimap canvas dimensions, persisted minimap zoom, and game zoom isolation.
- Remove the one-glyph-per-10-by-10-region approximation from the active minimap path.
- Add pixel/order and browser checks against the game rendering contract, including crispness at the fixed minimap footprint.
- Add a screenshot-led check that matching zoom values produce equal cell spacing and glyph scale, with any unused minimap area treated as intentional letterbox/crop space.

## Capabilities

### New Capabilities

- `minimap-render-parity`: Keep the minimap's rendered world composition visually consistent with the game world at each minimap zoom.

### Modified Capabilities

- None.

## Impact

- Affects the Babylon Lite minimap canvas renderer and focused minimap tests.
- Reuses the existing world-cell, glyph-cache, palette, fog, viewport, and marker concepts; no dependency changes are expected.
