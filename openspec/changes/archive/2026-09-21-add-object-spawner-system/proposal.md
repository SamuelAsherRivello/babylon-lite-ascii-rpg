# Proposal

## Why

World-distributed things are currently split between a pickup system, world-generation helpers, quest setup, torch placement, and realm-transition logic. This makes it difficult to add new glyph-based world content consistently, and it prevents quests from using one authoritative spawning boundary. A formal Object Spawner System will centralize object definitions, placement, collision behavior, palette identity, and level-distribution rules while preserving the distinction between consumable pickups and persistent objects.

## What Changes

- Add an Object Spawner System in `object-spawner-system.js` that owns every glyph-based world object.
- Replace the existing `pickup-system.js` runtime boundary with the Object Spawner System while retaining pickup collection semantics.
- Define object metadata in JSON, including glyph, name, `IsPickup`, `IsLevelSpawned`, consequence, log text, and distribution rules.
- Keep Gold as a quest-requested pickup with `IsLevelSpawned: false`; the quest system requests exactly three Gold objects.
- Level-spawn Hearts, Torches, Traps, and paired Stairs during the final object-spawner world-generation phase.
- Make Hearts use the palette-driven red `♥` glyph shared with the character HUD.
- Replace the non-interactable `T` torch glyph with the candle glyph `🕯️`, adding it to the editable palette with a color if required by the palette inventory.
- Use `☠` for persistent traps and retain persistent paired stairs for realm transitions.
- Preserve the exact player-facing log formats for Gold, Hearts, and Traps; realm-entry logs remain owned by the Realm System, including initial entry.
- Make object locations, counts, amounts, consequences, and distribution parameters JSON-configurable while retaining deterministic seeded generation.
- Add the Object Spawner distribution as the final world-generation phase after player placement.
- Update minimap, lighting, rendering, and collision integrations to consume the centralized object state.

## Capabilities

### New Capabilities

- `object-spawner-system`: Defines glyph-based world objects, pickup versus persistent-object behavior, JSON metadata, seeded placement, collision effects, and final-pass distribution.

### Modified Capabilities

- `questing-system`: Gold spawning is requested through the Object Spawner System, and collectible behavior/logging expands from the former pickup-only model.
- `world-generation-passes`: Adds the Object Spawner System as the final pass after player placement.
- `procedural-level-generation`: Moves level-spawned torches, traps, hearts, and paired stairs into the final object layer while preserving layered terrain and walkability.
- `random-torch-placement`: Replaces the standalone `T` torch contract with the persistent `🕯️` Torch object and Object Spawner distribution rules.
- `minimap-markers`: Uses centralized object state for pickup and Torch markers without exposing mutable world state to React.
- `ascii-palette`: Adds or customizes every object glyph and assigns palette colors, including red `♥`, `☠`, `🕯️`, Gold, and Stairs.
- `game-layer-architecture`: Keeps object spawning, collision, consequences, lighting inputs, realm transitions, and rendering authoritative in Babylon Lite.

## Impact

- Affected runtime files include the Babylon Lite systems, world generation, quest integration, minimap renderer, lighting inputs, bridge-facing snapshots, and palette data.
- `quest-system.js` remains the quest authority; `object-spawner-system.js` becomes the object and pickup authority.
- Existing tests importing `pickup-system.js` will move to the new system boundary and gain persistent-object coverage.
- No new runtime dependency is expected.
- Implementation must preserve the narrow React bridge and must not expose mutable object coordinates or world state to React.
- The proposal assumes the current 512×512 realm and zoom-5 density target used during exploration; exact JSON ranges remain implementation-time configuration subject to the stated approximately 5% per-screen target.
