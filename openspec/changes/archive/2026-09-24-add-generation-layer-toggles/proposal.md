# Proposal

## Why

The Procedural Level Generation window exposes density controls but cannot exclude a generation layer. Developers need to isolate terrain and feature layers while retaining a valid, playable baseline world and preserving their choices across preview, confirmation, and reload.

## What Changes

- Add a persisted enabled state to every generation pass, defaulting legacy and newly created settings to enabled.
- Add a right-aligned, label-free checkbox to each pass and compound-card checkbox; use accessible enable/disable tooltips and let compound controls toggle only their direct children.
- Keep Ground, Walkability, and Player Position always enabled and visibly unavailable for toggling; allow every other pass to run or be skipped independently.
- Apply enabled state consistently to the settings-map preview and live generation, so disabled optional layers contribute no terrain feature, object, civilization feature, or dynamic spawner while the game still starts and runs.
- Preserve each optional pass's density while disabled, restoring it when the pass is re-enabled; retain deterministic output for a fixed seed and complete settings selection.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `procedural-generation-settings`: persist and edit enabled state alongside density in the Procedural window.
- `world-generation-passes`: permit independent optional-pass skipping while retaining the required playable baseline and ordered pipeline.
- `object-spawner-system`: omit disabled ambient object and stair distributions without affecting requested quest objects.
- `underground-civilization`: omit disabled optional civilization sublayers while preserving terrain integrity.
- `enemy-spawner-system`: omit disabled enemy-spawner distribution without affecting the playable Underground realm.

## Impact

- Affected source: generation registry/profile, settings persistence, Procedural React window, world generation, preview rendering, and live game-session orchestration.
- Affected tests: generation settings/store, feature registry, world generation, object/civilization/enemy-spawner systems, and UI source contracts.
- Existing saved settings remain compatible: an absent enabled value normalizes to `true`; no runtime dependency or public bridge API is added.
