# Proposal

## Why

Opening the fullscreen map view can block the browser while the full selected
realm is composed and painted in one synchronous pass. The shared world-view
renderer is the right place to make this work cooperatively because the same
composition pipeline already serves the game view, minimap, and map window.

## What Changes

- Add a reusable cooperative world-view rendering mode that can draw a
  composition incrementally, yielding between row or cell batches within a
  bounded frame budget.
- Keep the existing synchronous render path for current game-view and minimap
  callers.
- Apply the cooperative mode only to the developer map window in this change.
- Cancel stale map-window render jobs when the map closes, the diagnostic realm
  changes, the map canvas resizes, or the game layer is disposed.
- Preserve final visual output: full-realm map content, diagnostic lighting and
  fog bypass behavior, marker order, and map resource cleanup remain unchanged.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `world-view-rendering`: add a reusable cooperative world-view render contract
  that preserves pass order and final output while yielding browser control
  during long render jobs.
- `map-window`: render the fullscreen diagnostic map through the cooperative
  world-view path while retaining current map-window behavior and cleanup.

## Impact

- Affected code: `ascii-rpg/src/client/game-layer-babylon-lite/world-view.js`,
  `ascii-rpg/src/client/game-layer-babylon-lite/index.js`, map-window renderer
  helpers, and focused client tests.
- No new runtime dependency is expected; the implementation should use
  `requestAnimationFrame`, cancellation tokens/job ids, and existing local
  rendering helpers.
- Existing synchronous world-view callers remain compatible unless they opt in
  to the cooperative renderer.
