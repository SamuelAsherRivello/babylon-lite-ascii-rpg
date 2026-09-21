# Proposal

## Why

Realm transfer can briefly expose an empty or newly attached Babylon sprite
layer at the covered-to-opening boundary. The iris is intended to hide the
realm swap, but the current midpoint path can clear the old submissions and
then remove/recreate the render layer before the destination frame is visible,
causing a one-frame flicker. This should be fixed now because it undermines the
readability of both stair transfers and Settings-triggered realm changes.

## What Changes

- Preserve the existing Babylon game sprite layer attachment throughout a realm
  transfer; update or reuse its submitted slots while the transition is fully
  covered.
- Prevent destination glyph-cache or atlas reconciliation from exposing an
  empty layer between the covered and opening phases.
- Keep the transition mask fully opaque until the destination realm has been
  rendered and synchronously presented.
- Add focused coverage for both realm directions and the covered-to-opening
  handoff, including a regression assertion that no render-layer detach/attach
  occurs during the swap.
- Preserve paired-stair arrival, realm status publication, input locking,
  fog-of-war isolation, and existing React UI visibility.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `world-realms`: A paired-stair realm transfer SHALL replace the visible world
  while fully covered without exposing an empty intermediate render layer.
- `game-layer-architecture`: Babylon Lite SHALL preserve game-layer renderer
  continuity across a covered realm swap and SHALL present the destination
  frame before opening the transition mask.

## Impact

- Affects `ascii-rpg/src/runtime/game-layer-babylon-lite/index.js` and the
  closest mirrored game-layer transition/integration tests.
- May adjust the existing sprite-layer reconciliation seam, but introduces no
  dependency or bridge/API change.
- Manual browser verification remains required on the actual playable project
  root URL for both stair directions and the Settings realm command.
