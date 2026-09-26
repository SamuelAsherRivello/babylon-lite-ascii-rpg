# Tasks

## 1. Death-presentation state and timing

- [x] 1.1 Add a game-layer-owned, idempotent death-presentation coordinator that enters dying on the authoritative death transition and verify focused Node coverage shows gameplay remains dead while recovery is not yet ready.
- [x] 1.2 Connect the existing hero death animation completion to one cancellable 500 ms post-animation delay, and verify focused clock/animation-completion tests show readiness occurs neither early nor more than once.
- [x] 1.3 Cancel pending death-presentation work on revive, restart, and disposal, and verify focused tests prove a stale callback cannot expose recovery in a revived or torn-down session.

## 2. Bridge and UI behavior

- [x] 2.1 Publish an immutable recovery-ready snapshot through the bridge/controller boundary while preserving the existing authoritative dead snapshot, and verify bridge tests cover false, delayed true, and reset-to-false transitions.
- [x] 2.2 Render the existing `Adventure` recovery window only from recovery readiness, preserve its restart actions, and verify focused UI tests cover hidden-before-ready and visible-after-ready behavior.
- [x] 2.3 Narrow post-death event blocking to gameplay actions so ordinary UI controls remain usable without allowing any dead-run mutation; verify focused input tests cover keyboard, swipe/pointer navigation, combat, a recovery action, and a non-gameplay UI control.

## 3. Integration verification

- [x] 3.1 Run the affected Node test files and `npm.cmd run build` from the repository root; verify both succeed without adding or running Playwright tests.
- [x] 3.2 Manually verify a seeded browser run with an intentional lethal event: game input stops immediately, the full death animation remains visible, the menu appears 500 ms after its final frame, ordinary UI controls remain usable, and both available restart choices work only after the menu appears.
