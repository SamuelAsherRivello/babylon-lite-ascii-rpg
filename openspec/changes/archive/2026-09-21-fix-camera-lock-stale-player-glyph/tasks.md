# Tasks

## 1. Reconcile game-view sprite slots

- [x] 1.1 Update the game-view world composition pass in `ascii-rpg/src/runtime/game-layer-babylon-lite/index.js` to visit every bounded source cell while preserving the existing undiscovered-cell hide path; verify undiscovered cells still submit no visible glyph.
- [x] 1.2 Preserve the existing Camera Lock origin and wrapping behavior while routing shifted viewports through the slot-reconciliation pass; verify the player remains at the opposite screen edge after valid horizontal and vertical wraps.

## 2. Add focused regression coverage

- [x] 2.1 Add a rendering test that marks a slot visible, renders an undiscovered cell into that same slot, and verifies the slot becomes hidden; verify the slot can become visible again when a discovered cell is rendered.
- [x] 2.2 Add or extend Camera Lock coverage for a viewport shift that exposes an undiscovered cell in a previously occupied edge slot; verify no stale `P` remains and movement/time behavior is unchanged.

## 3. Validate the change

- [x] 3.1 Run the focused game-layer and camera Node tests and verify all new and existing assertions pass.
- [x] 3.2 Run the repository's standard Node test suite and production build from the repository root; verify both complete successfully without modifying unrelated work.
- [x] 3.3 Manually verify Camera Lock movement in the running browser at the configured project-root URL, including an edge wrap and fogged newly exposed cells; verify only the current player glyph remains visible.
