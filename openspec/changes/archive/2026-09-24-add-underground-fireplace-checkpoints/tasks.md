# Tasks

## 1. Fireplace objects and checkpoint events

- [x] 1.1 Add the persistent `🔥` Fireplace catalog and editable palette entry; extend catalog and palette tests to verify the glyph is accepted and rendered.
- [x] 1.2 Generate Fireplaces only after Underground civilization groups, with deterministic Low, Med, and High counts based on the trap baseline and no overlapping cells; add focused object/world tests for density, realm restriction, and repeatable seed output.
- [x] 1.3 Add session-only checkpoint state and a checkpoint event when a living player enters a Fireplace; verify persistent re-entry, replacement by a later Fireplace, exact `You saved a checkpoint.` event text, and no storage write in focused tests.

## 2. Recovery and run replacement

- [x] 2.1 Extend the authoritative player lifecycle with a full-health revive transition that publishes a non-dead snapshot; verify dead input remains blocked until revival and revival restores 100 health.
- [x] 2.2 Implement controller-driven checkpoint recovery through existing realm, occupancy, fog, camera, minimap, and rendering paths; verify recovery reaches the latest checkpoint without resetting the current world, inventory, quest, experience, combat state, or time.
- [x] 2.3 Use the captured original seed for `Restart game` through a browser refresh; verify the refresh clears the session-only checkpoint, reproduces the same seed, and resets run state.

## 3. User interface and verification

- [x] 3.1 Forward checkpoint events through the bridge to the existing toast provider and replace the death modal's single reload action with `Restart from checkpoint` and `Restart game`; verify exact labels, toast copy, bridge/controller calls, and disabled-before-checkpoint/enabled-after-checkpoint states in focused UI and bridge tests.
- [x] 3.2 Run the affected Node test files and `npm.cmd test` from the repository root; verify all checks pass.
- [x] 3.3 Run `npm.cmd run build` from the repository root and manually verify an Underground Fireplace saves a checkpoint, checkpoint recovery preserves the run, Restart game recreates the original seed, and a browser refresh has no checkpoint.
