# Tasks

## 1. Camera state and geometry

- [x] 1.1 Add validated camera-mode values, exact display labels, default selection, and persisted preference helpers; verify invalid or missing storage falls back to `Camera Center`.
- [x] 1.2 Extend the Babylon Lite player-grid camera calculations for center, dead-zone, and lock modes; verify unit tests cover origin resolution, 20%-of-viewport dead-zone thresholds independent of zoom, viewport clamping, and small-view safeguards.
- [x] 1.3 Implement screen-edge wrap resolution for `Camera Lock` while preserving world walkability and time rules; verify unit tests cover all four directions and blocked/non-walkable wrap targets.

## 2. UI and bridge integration

- [x] 2.1 Add the persisted Settings control directly beneath Fullscreen with the exact labels `Camera Center`, `Camera Deadzone`, and `Camera Lock`; verify UI source tests cover initial rendering and the complete cycle.
- [x] 2.2 Add a narrow bridge command/snapshot for camera mode and connect React changes to the authoritative Babylon Lite game controller; verify bridge tests cover valid mode delivery and invalid-mode rejection or fallback.
- [x] 2.3 Update zoom, resize, movement, and visible-region coordination so the selected mode remains active without regenerating the world or resetting the player; verify focused client tests cover state preservation.

## 3. Regression and delivery verification

- [x] 3.1 Update existing player-grid and zoom tests/spec-aligned expectations so fixed-origin behavior is covered as `Camera Lock`; verify `npm.cmd test` passes.
- [x] 3.2 Add focused integration assertions for Settings-to-game camera changes and movement transitions; verify the existing Node test command passes without adding Playwright tests.
- [x] 3.3 Build the application and inspect the Settings layout for the exact control order and labels; verify `npm.cmd run build` succeeds and manual browser verification confirms each mode's visible behavior.
