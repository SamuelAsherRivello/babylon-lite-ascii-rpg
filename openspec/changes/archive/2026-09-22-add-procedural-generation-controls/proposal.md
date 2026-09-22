# Proposal

## Why

Developers cannot currently adjust the world generator's layer-specific density and distribution settings without editing source. A visible, persisted control surface makes it practical to compare procedural-world outcomes while preserving the current generator as the baseline.

## What Changes

- Add a `Procedural` developer-window launcher and a `Level Generation` tab.
- Present eight ordered world-generation cards under `Procedural Level Generation Passes`. The Object Distribution card groups individual Heart, Trap, and Torch subrows.
- Provide Low, Med, and High Density & Distribution selections for each configurable pass and each Object Distribution subrow, with `Med` representing the current behavior. Player Position remains a visible static pass with no density control.
- Divide the Level Generation window into an independently scrollable 50% options pane and a 50% live settings-map preview pane.
- Keep edits as an unpersisted draft while a settings-map preview redraws for every pass choice; persist the complete catalog only after `Confirm`, while `Cancel` discards the draft.
- Persist confirmed selections to a checked-in local development settings file through the Vite server, with browser local storage as the deployed fallback.
- Regenerate the game after a successful confirmation so the selected settings are observable immediately.
- Apply the selected settings only through their owning generator passes while retaining deterministic seeded output for identical settings.

## Capabilities

### New Capabilities

- `procedural-generation-settings`: Developer-facing ordered pass catalog, density selection, persistence, and regeneration behavior.

### Modified Capabilities

- `world-generation-passes`: Pass-scoped parameters accept the selected density and distribution profile without changing pass order or layer ownership.
- `procedural-level-generation`: Generated realm output uses the selected cave, water, walkability, player-position, and object-distribution settings while retaining valid, connected worlds.
- `underground-civilization`: Civilization placement accepts its selected density profile.
- `enemy-spawner-system`: Underground normal-spawner distribution accepts its selected density profile.

## Impact

- Affects the React developer UI, React-to-game preview bridge, Vite development middleware, generation-settings data/store, world/realm generation, object placement, civilization placement, and enemy-spawner placement.
- No new runtime dependency or public network service is introduced; local file writes remain limited to Vite development.
