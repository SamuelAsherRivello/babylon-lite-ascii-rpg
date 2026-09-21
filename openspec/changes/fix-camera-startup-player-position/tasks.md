# Tasks

## 1. Startup camera origin

- [x] 1.1 Update the player-grid startup-origin calculation so Center,
  Deadzone, and Lock all begin from the player-centered viewport origin while
  preserving world-boundary clamping; verify the camera-grid unit tests report
  a centered startup origin for all three modes.
- [x] 1.2 Ensure the Babylon Lite game layer resolves that startup origin before
  the first visible world render and keeps the player's generated world cell
  unchanged; verify the startup regression test observes the centered first
  frame and unchanged initial x/y cell.
- [x] 1.3 Preserve post-startup camera-mode behavior for movement, resize,
  zoom, and realm transitions, including Lock edge wrapping; verify the
  existing camera, zoom, realm, and movement tests remain passing.

## 2. Regression coverage

- [x] 2.1 Extend player-grid tests to restart each camera mode, assert the
  player's initial screen center and world x/y, apply one valid input, and
  assert an exact one-cell world-position delta; verify the focused player-grid
  test passes for Center, Deadzone, and Lock.
- [ ] 2.2 Run the repository's existing Node test suite and production build;
  confirm no unrelated camera-mode or movement behavior regresses by recording
  both commands as successful.
