# Tasks

## 1. Camera Trigger Plumbing

- [x] 1.1 Add an explicit aspect-change snapshot path from React settings through the bridge to the game controller, and verify a bridge test proves aspect changes reach a newly registered controller.
- [x] 1.2 Add a centralized game-layer camera-origin resolver with intents for initial placement, active-mode placement, resize placement, and transition-preserving placement, and verify existing player-grid camera behavior tests still pass.
- [x] 1.3 Route first playable render, camera mode changes, zoom changes, movement, programmatic player relocation, and realm activation through the centralized resolver, and verify focused source or unit tests cover each trigger name.
- [x] 1.4 Route browser resize, orientation change, canvas `ResizeObserver`, and aspect-change handling through resize-aware recalculation, and verify resize-before-world remains guarded from missing world/player state.

## 2. Rendering Correctness

- [x] 2.1 Ensure every trigger that changes viewport dimensions, view origin, active realm, or visible world cells reconciles the full visible region before presentation, and verify stale cells are cleared in focused rendering or source-level tests.
- [x] 2.2 Preserve realm transition presentation while resolving the destination origin through the new camera intent, and verify stair/settings realm transfer still prepares the destination before revealing it.
- [x] 2.3 Preserve current camera labels, persistence keys, cycling order, zoom range, minimap zoom independence, and world generation behavior, and verify existing camera, zoom, and bridge tests still pass.

## 3. Validation

- [x] 3.1 Run focused Node tests for bridge camera/aspect forwarding, player-grid camera origin behavior, game-layer viewport recalculation, and main source guards; record the exact command and result.
- [x] 3.2 Run `npm.cmd test` from the repository root and verify the test suite passes or document any unrelated pre-existing failures.
- [x] 3.3 Run `npm.cmd run build` from the repository root and verify the production build succeeds.
- [x] 3.4 Manually verify the running app at the configured Vite base by checking startup, camera mode change, realm change, zoom change, aspect change, browser resize, and movement all keep the player in a valid camera view without stale cells.
