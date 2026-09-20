# Tasks

## 1. Minimap-scale state

- [x] 1.1 Replace the game-zoom notification with a dedicated bounded minimap-scale notification, verifying focused bridge tests prove a minimap-originated scale reaches subscribers and is reapplied to a controller without calling game `setZoom`.
- [x] 1.2 Add a hidden persisted minimap-scale state in the React UI with a default of `5`, verifying the value is restored after initialization without adding a displayed zoom number.

## 2. Minimap interaction

- [x] 2.1 Make the visible minimap canvas cycle only the scale of its rendered map content `1 → 5 → 10 → 1`, preserving its established on-screen size and corner placement; verify focused game-layer tests cover advance, wrap, unchanged canvas bounds, and game-zoom isolation.
- [x] 2.2 Ensure a hidden minimap emits no scale selection, no numeric minimap scale is rendered, and game disposal removes its minimap input handler; verify focused tests cover hidden state and listener cleanup.

## 3. Validation

- [x] 3.1 Run the repository's Node test suite with `npm.cmd test` from the verified npm project root and confirm the new focused cases pass.
- [x] 3.2 Run `npm.cmd run build` from the verified npm project root and manually confirm that repeated minimap clicks zoom only its rendered content without changing its on-screen bounds, preserve the game `Zoom + N -` display, and survive a browser refresh; do not create or run Playwright tests.
