# Tasks

## 1. Generation settings data and persistence

- [x] 1.1 Define ordered pass records and Low, Med, High profile mappings for each configurable generator input, with Med verified against current generation defaults and Player Position retained as a fixed baseline.
- [x] 1.2 Add validated development-file loading and atomic persistence plus deployed local-storage fallback; verify malformed values recover to Med.
- [x] 1.3 Start the game only after generation settings are resolved and pass the immutable selection catalog into the game layer; verify initial generation receives the saved catalog.

## 2. Procedural developer UI

- [x] 2.1 Add the `Procedural` Windows launcher and responsive Level Generation modal; verify all eight ordered cards are reachable in landscape and portrait, including grouped Heart, Trap, and Torch Object Distribution subrows.
- [x] 2.2 Render Low, Med, and High D&D controls with selected-state and current-profile copy for configurable entries; verify keyboard and pointer selection work while Player Position remains static.
- [x] 2.3 Persist a successful selection and restart the game; verify the selected card remains marked after restart.

## 3. Pass-scoped generation integration

- [x] 3.1 Apply Ground, Cave / Walls, Water, Walkability, and Player Position profiles while retaining connected terrain and valid player placement; verify seeded profile-specific worlds are repeatable.
- [x] 3.2 Apply Object Distribution, Civilization, and Enemy Spawner Distribution profiles through their existing pass owners; verify occupancy exclusions and Overground civilization restrictions remain intact.
- [x] 3.3 Verify Med output preserves the current default generation parameters and every profile stays within bounded safe ranges.

## 4. Verification

- [x] 4.1 Add focused Node coverage for settings validation, persistence fallback, profile resolution, and deterministic generation behavior.
- [x] 4.2 Run `npm.cmd test` and `npm.cmd run build`; manually verify a local Vite selection writes the settings file and visibly regenerates the world.

## 5. Draft preview and confirmation

- [x] 5.1 Replace immediate selection persistence with a normalized modal draft and Confirm/Cancel actions; verify Cancel performs no file or local-storage write.
- [x] 5.2 Divide Level Generation into equal-width independently scrollable options and settings-map preview panes; verify the eight cards and action row remain reachable.
- [x] 5.3 Render the deterministic settings-map preview through the game layer for each draft update without mutating the active world; verify only the latest rapid selection is displayed.
- [x] 5.4 Run focused checks, `npm.cmd test`, and `npm.cmd run build`; manually verify draft preview, Cancel, and Confirm persistence/restart behavior.

## 6. Preview realm selection

- [x] 6.1 Add a shared action-row parent with left-aligned Confirm/Cancel and right-aligned Overworld/Underworld preview toggle; verify the action row remains anchored below the scrollable options.
- [x] 6.2 Regenerate and render only the selected preview realm after a realm toggle without mutating the active realm or persisted catalog; verify both preview realms.
