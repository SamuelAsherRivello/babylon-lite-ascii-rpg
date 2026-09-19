# Tasks

## 1. Zoom contract and viewport math

- [x] 1.1 Add bounded zoom constants with default value `5` and derive scaled
  cell dimensions from the existing `32 x 32` baseline.
- [x] 1.2 Verify zoom `1`, `5`, and `10` visible-cell counts at `1280 x 720`.

## 2. UI and bridge

- [x] 2.1 Add the lower-left Settings `Zoom + N -` control with accessible
  labels and bounds.
- [x] 2.2 Add a narrow bridge command that forwards zoom changes to Babylon
  Lite.

## 3. Fixed world and rendering

- [x] 3.1 Generate one fixed oversized world with a permanent non-walkable
  outer border.
- [x] 3.2 Keep a clamped fixed viewport origin, recenter it on zoom so the
  player remains visible, and allow the player to leave the visible window
  during movement without following it.
- [x] 3.3 Resize sprite-layer capacity when zoom changes and preserve world and
  player state across zoom and browser resize.

## 4. Verification

- [x] 4.1 Add focused tests for zoom math, bridge forwarding, UI presence, and
  world-border guarantees.
- [x] 4.2 Run the Node test suite and production build.
- [x] 4.3 Manually verify the browser control changes `5 → 6 → 5`.
