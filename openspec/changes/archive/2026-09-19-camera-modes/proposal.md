# Proposal

## Why

The current game uses a fixed viewport origin, so movement can make the player
leave the visible area and can feel like the player is moving through a static
window rather than the camera following the player. The game needs an explicit,
discoverable camera preference so players can choose centered following,
bounded following, or edge-wrapping movement.

## What Changes

- Add a persisted camera mode setting beneath the existing Fullscreen setting.
- Cycle the setting through the exact labels `Camera Center`, `Camera Deadzone`,
  and `Camera Lock`.
- Define `Camera Center` as continuous camera following that keeps the player
  at the screen center whenever world bounds permit it.
- Define `Camera Deadzone` as camera following with a centered rectangular dead
  zone extending 20% of the visible screen width and 20% of the visible screen
  height from the player, independent of zoom and subject to viewport bounds.
- Define `Camera Lock` as camera wrap: the camera does not follow during normal
  movement, and crossing a screen edge wraps the player and visible world to the
  opposite edge.
- Preserve the selected mode across reloads and keep zoom, resize, palette, and
  world state behavior coherent with the selected camera mode.
- Update movement and viewport contracts so the current fixed-origin behavior is
  represented as the new `Camera Lock` behavior rather than remaining an
  implicit default.

## Capabilities

### New Capabilities

- `camera-modes`: User-selectable camera following, dead-zone following, and
  edge-wrapping camera behavior, including the Settings control and persistence.

### Modified Capabilities

- `player-grid-movement`: Movement and world-edge requirements change to support
  camera following and camera-wrap behavior selected by the active mode.
- `zoom-levels`: Viewport-origin and player-visibility requirements become
  camera-mode-dependent, including viewport-relative dead-zone dimensions.

## Impact

- React UI: the Settings section in `ascii-rpg/src/client/ui-layer-react/App.jsx`
  and its local preference handling.
- Bridge: a narrow camera-mode command/snapshot between React and Babylon Lite.
- Babylon Lite: player-grid movement, viewport-origin calculation, visible-region
  rendering, world-edge handling, and resize/zoom synchronization.
- Tests: mirrored Node tests for camera calculations, mode cycling/persistence,
  movement at screen and world edges, dead-zone thresholds, and wrap behavior.
- No new dependency is expected.
