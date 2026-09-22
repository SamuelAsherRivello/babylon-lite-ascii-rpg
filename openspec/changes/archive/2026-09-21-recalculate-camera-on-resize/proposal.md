# Proposal

## Why

The game currently rebuilds its logical viewport when the canvas changes size,
but resizing can leave the active camera composition stale because the camera
position is not explicitly recalculated for the new visible dimensions. This is
particularly visible when switching between landscape and portrait layouts or
when the active camera mode depends on viewport width and height.

## What Changes

- Recalculate the active camera view after every effective canvas resize,
  orientation change, or observed canvas dimension change.
- Reapply the selected camera mode against the new viewport dimensions while
  preserving the player’s intended screen placement where the mode permits it.
- Keep camera origins clamped to the generated world and preserve existing
  center, deadzone, and lock-mode semantics at world boundaries.
- Ensure the resized world render and minimap use the same recalculated camera
  composition without leaving stale cells from the previous viewport.
- Add focused automated coverage for resize recalculation across the supported
  camera modes and representative landscape/portrait viewport changes.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `camera-modes`: Camera behavior must be recalculated when the visible
  viewport dimensions change, in addition to ordinary movement and zoom
  changes.

## Impact

- Affected client: `ascii-rpg/src/client/game-layer-babylon-lite/index.js`
  and the camera/view-origin helpers under the same game-layer module.
- Affected tests: camera and world-view tests, plus source-level game-layer
  resize coverage as appropriate to the existing test strategy.
- No new dependency, public API, persistence key, or user-facing settings
  control is required.
- Acceptance is based on the existing Node test suite, production build, and
  manual browser verification while changing between supported viewport
  shapes.
