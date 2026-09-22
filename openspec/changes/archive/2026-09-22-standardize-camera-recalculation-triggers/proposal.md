# Proposal

## Why

Camera mode behavior is currently specified for movement and viewport resize,
but the game has more client events that can invalidate the visible world
origin. This change makes camera recalculation explicit and consistent whenever
the player anchor, active world, selected camera mode, or effective viewport
changes.

## What Changes

- Define the complete set of gameplay and presentation events that must
  reconsider the active camera mode.
- Treat aspect-mode changes as an explicit camera recalculation trigger, not
  only an indirect consequence of layout resize timing.
- Keep realm transfer presentation stable while still routing its destination
  camera origin through the same camera-resolution contract.
- Preserve current camera mode labels, persistence, zoom range, world size, and
  realm-transition behavior.
- Add focused validation for startup, realm transfer, zoom, aspect, resize,
  orientation/canvas resize, movement, and programmatic player relocation.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `camera-modes`: Clarify every event that must recalculate the visible world
  origin using the active camera mode.

## Impact

- Affected code: `ascii-rpg/src/client/game-layer-babylon-lite/index.js`,
  `ascii-rpg/src/client/game-layer-babylon-lite/characters/player/player-grid.js`,
  `ascii-rpg/src/client/bridge-layer/game-bridge.js`, and
  `ascii-rpg/src/client/ui-layer-react/App.jsx`.
- Affected systems: camera mode selection, world viewport origin, zoom changes,
  realm transitions, aspect-mode presentation, resize/orientation/canvas layout
  handling, movement, and any game-layer-owned player relocation helpers.
- No dependency changes are expected.
- Acceptance criteria: the active camera mode is considered at game startup,
  camera mode changes, realm changes, zoom changes, aspect ratio changes,
  browser resize, orientation change, canvas resize, player movement, and
  programmatic player relocation; all resulting views clamp to valid world
  bounds and render without stale cells.
