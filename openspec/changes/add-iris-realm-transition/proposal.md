# Proposal

## Why

Realm transfer currently changes the active world immediately when the player
enters an `S` stair cell, so the player can see the world swap rather than
experiencing a deliberate scene transition. A reusable transition system will
make realm changes readable and extensible while preserving the existing
ownership boundary: the game layer controls gameplay presentation and the React
UI remains visible above it.

## What Changes

- Add a game-layer transition capability that can target a named render layer,
  run a timed animation, pause gameplay input for its active interval, and emit
  lifecycle events around the transition.
- Add a soft-edged black iris mask over the entire game layer, with a 500ms
  closing phase, a 100ms fully covered hold, and a 500ms opening phase.
- Center the iris on the player's rendered screen-space cell center, rather
  than assuming the viewport or screen center.
- Use the iris transition for both directions of `S`-cell realm transfer:
  close from a fully visible game view to a character-sized opening, swap the
  active realm while the game view is fully covered, then open from the center
  to reveal the destination realm.
- Keep the React `ui_layer`, HUD, settings, and other UI overlays outside the
  transition mask and interactive/visible according to their existing behavior.
- Ensure keyboard, pointer, swipe, and repeated movement input cannot move the
  player or retrigger a realm transfer while the transition is running.
- Preserve the existing paired-stair arrival coordinate, realm persistence,
  fog-of-war isolation, and bridge realm-status update semantics.
- Preserve the player's screen-space position across the realm swap, including
  off-center positions within the current camera view.

## Capabilities

### New Capabilities

- `game-layer-transitions`: Reusable timed, animated game-layer transitions
  with lifecycle events and a soft-edged iris implementation.

### Modified Capabilities

- `world-realms`: Realm transfer through paired stairs is presented as a
  blocking iris transition with the realm swap at full coverage.
- `game-layer-architecture`: The Babylon game layer owns transition rendering
  and input suspension while the React UI layer remains outside the mask.

## Impact

- A new Babylon Lite transition system and transition-mask rendering surface
  under `ascii-rpg/src/runtime/game-layer-babylon-lite/`.
- Realm activation and movement input handling in the Babylon game controller,
  plus focused mirrored Node tests for timing, lifecycle ordering, input lock,
  and realm-transfer integration.
- Existing game-layer CSS/container stacking may need a narrowly scoped
  game-layer-only mask surface; no new dependency is expected.
- The attached image is a visual reference for a feathered/soft iris edge. The
  implementation should use a runtime-rendered gradient edge rather than add
  the reference image as an application asset.
