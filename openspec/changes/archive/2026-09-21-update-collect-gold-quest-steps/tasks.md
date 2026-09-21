# Tasks

## 1. Event and quest contracts

- [x] 1.1 Add the generic gameplay event stream and verify producers can publish immutable events while subscribers receive realm-entry and pickup-collected events.
- [x] 1.2 Extend `quest_data.json` and the Quest System model for ordered steps, active-step filtering, step completion, and idempotent transitions; verify focused quest unit tests cover matching and unrelated events.
- [x] 1.3 Add initial and transitioned realm-entry publication at the realm boundary without adding quest references; verify realm-event tests cover Overground, Underground, and stair transfers.

## 2. Collect Gold runtime integration

- [x] 2.1 Connect the Quest System to the shared event stream and defer the gold pickup request until the Overground step completes; verify Underground startup creates no quest gold and Overground activation creates exactly three pickups.
- [x] 2.2 Preserve Object Spawner ownership of pickup effects and generic pickup events while adapting its event publication; verify a gold collision credits exactly one gold and repeated collision cannot recollect it.
- [x] 2.3 Update game-layer quest snapshots and lifecycle notifications for ordered steps; verify snapshots remain immutable and progress ignores gold events before the gold step is active.

## 3. Bridge and HUD

- [x] 3.1 Extend the narrow bridge contract for ordered quest-step snapshots without exposing world or pickup state; verify bridge tests receive immutable initial, step-transition, progress, and completion snapshots.
- [x] 3.2 Render the two quest steps with the requested `Enter Overground Realm` and `Collect Gold 0 of 3` wording and completed styling; verify React HUD tests cover Underground, Overground, and completed states.
- [x] 3.3 Update quest lifecycle toast behavior for prerequisite completion, gold progress, and final completion; verify the existing start and completion messages remain compatible.

## 4. Verification

- [x] 4.1 Run the focused quest, object-spawner, realm, bridge, and HUD tests and verify all pass without modifying unrelated dirty files.
- [x] 4.2 Run the repository's full Node test suite and production build, then verify the live browser behavior for Overground start, Underground start followed by realm entry, and collecting all three gold pickups.
