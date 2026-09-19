# Proposal

## Why

The ASCII RPG currently renders a fixed-size glyph grid without a user-facing
way to change how much of the level is visible. A bounded zoom control makes it
possible to compare compact readable glyphs with a wider view of the level
while preserving one stable playable world and preventing the player from
escaping its boundary.

## What Changes

- Add a `Zoom + N -` control to the lower-left Settings UI.
- Start the control at zoom value `5` and clamp it to values `1` through `10`.
- Scale the logical grid cell dimensions from the current `32 x 32` baseline,
  so lower values show more smaller glyphs and higher values show fewer larger
  glyphs.
- Route zoom changes through the existing UI-to-Babylon bridge.
- Generate one fixed oversized level rather than regenerating a viewport-sized
  world whenever zoom or the browser size changes.
- Keep the outermost row and column of the generated world as non-walkable `W`
  cells and reject movement outside the world.
- Keep the initial view positioned around the starting cell, but do not follow
  the player after movement; the player may leave the visible screen while
  remaining inside the level.
- Add focused tests for zoom bounds, glyph density, bridge forwarding, and the
  permanent world border.

## Capabilities

### New Capabilities

- `zoom-levels`: User-controlled bounded zoom and fixed-level viewport behavior.

### Modified Capabilities

- `player-grid-movement`: The visible grid density and fixed-world viewport
  behavior are expanded to support zoom levels without allowing movement past
  the world boundary.

## Impact

- React Settings UI and styles under `ascii-rpg/src/runtime/ui-layer-react/`.
- The UI bridge under `ascii-rpg/src/runtime/bridge-layer/`.
- Babylon Lite viewport, sprite-layer capacity, rendering, and fixed-level
  startup under `ascii-rpg/src/runtime/game-layer-babylon-lite/`.
- Existing player-grid, bridge, page, and world-generation tests.
- No new runtime dependency or external service is required.
