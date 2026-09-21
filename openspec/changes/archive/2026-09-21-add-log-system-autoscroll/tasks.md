# Tasks

## 1. Implement the game-layer Log System

- [x] 1.1 Create `ascii-rpg/src/runtime/game-layer-babylon-lite/systems/log-system.js` using the existing Babylon Lite system conventions, with message-first event intake, optional policy metadata, line normalization, eight-line default retention, immutable snapshots, subscriptions, and disposal; verify focused Log System unit tests cover valid, rejected, multiline, ordered, bounded, and empty histories.
- [x] 1.2 Add mirrored `ascii-rpg/test/runtime/game-layer-babylon-lite/systems/log-system_tests.mjs` and verify the event contract never exposes mutable internal history to callers.
- [x] 1.3 Instantiate the Log System in Babylon Lite startup, route realm and pickup messages through it, remove the private `appendLog` ownership from `index.js`, and omit the redundant `Player` prefix; verify game-controller log snapshots stay ordered.

## 2. Preserve the narrow bridge contract

- [x] 2.1 Wire the game controller's Log System snapshot and subscription methods through `game-bridge.js` without exposing event metadata or mutable system state; verify bridge tests receive initial and updated immutable line snapshots.
- [x] 2.2 Update or add mirrored bridge/game-layer tests for subscriber cleanup, game-instance replacement, default retention, and existing log-producing paths; verify no React or DOM import enters the game-layer system.

## 3. Add scroll-aware Log presentation

- [x] 3.1 Refactor the React Log body into a focused component or equivalent ref boundary that renders ordered lines at the bottom and tracks a body ref plus bottom-proximity state; verify empty, single-line, and multi-line snapshots render without fabricated entries.
- [x] 3.2 Implement follow-bottom behavior that records whether the body was at the bottom before a snapshot update, autoscrolls only when it was at the bottom, and pauses while the player is above the bottom; verify focused tests cover new entries at bottom, new entries while scrolled up, and resumed autoscroll after returning to bottom.
- [x] 3.3 Preserve Log collapse/expand behavior, `log_box` IDs, `aria-expanded`, `aria-controls`, lower-right anchoring, and existing styles; verify source-level UI checks and manual browser inspection cover both panel states.

## 4. Validate the integrated behavior

- [x] 4.1 Run the complete `npm.cmd test` suite from the repository root and verify all existing and new tests pass.
- [x] 4.2 Run `npm.cmd run build` from the repository root and verify the production build succeeds.
- [x] 4.3 Manually verify the Log System in the running game: new gameplay events append at the bottom, bottom-follow autoscroll works, scrolling upward preserves the reading position, scrolling back to the bottom resumes autoscroll, and collapse/expand still works.
