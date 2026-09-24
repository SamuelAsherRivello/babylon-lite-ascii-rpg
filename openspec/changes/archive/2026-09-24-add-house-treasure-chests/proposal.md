# Proposal

## Why

Generated houses currently provide shelter and a key/door interaction, while treasure chests are created only by the independent object-distribution layer. Giving every accepted house its own interior treasure creates a reliable reward for exploring houses without removing or changing the existing standalone chest population.

## What Changes

- Add exactly one regular interactive treasure chest to every generated Overworld house.
- Select the chest cell from the house's four walkable interior corner cells using the house generation random stream so identical seeds reproduce identical placements.
- Keep the existing standalone chest generation layer, density settings, distribution rules, and rewards unchanged.
- Register house chests through the existing object-spawner system so they use the normal chest glyphs, opening lifecycle, reward effects, `chest-opened` event, and quest integration.
- Reserve house-chest cells during house placement and preserve house, door, key, and object non-overlap guarantees.

## Capabilities

### New Capabilities

- `house-treasure-chests`: Defines guaranteed per-house chest generation, corner placement, deterministic selection, reservation, and normal chest interaction behavior.

### Modified Capabilities

- `object-spawner-system`: Extends level-spawned chest placement to include house-owned chests while preserving the existing catalog and interaction contract.
- `procedural-level-generation`: Extends the Overworld building pass with one chest per accepted house while retaining the independent object-distribution chest pass.

## Impact

- Affects `ascii-rpg/src/client/game-layer-babylon-lite/index.js`, `systems/building-system.js`, and focused building/object/world-generation tests.
- May extend the Building record with a selected interior chest cell or equivalent placement data and identify the spawned object with its owning `buildingId`.
- No new dependencies, settings, save migrations, renderer changes, or external APIs are required.
- Existing worlds are unaffected until regenerated; standalone chest counts remain governed by the current generation settings.
