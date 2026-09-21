# Design

## Context

See proposal.md and the object-spawner-system delta. The current Babylon Lite runtime creates Gold, health, and Trap pickups in `index.js`, stores pickup behavior in `systems/pickup-system.js`, generates Torches and paired Stairs in `systems/world-system.js`, and gives the minimap and lighting code separate access to `world.pickups` and `world.torches`. The current world pass list ends at player placement, while quest data owns Gold distances.

## Goals / Non-Goals

**Goals:**

- Establish `systems/object-spawner-system.js` as the single object authority.
- Keep `systems/quest-system.js` as quest authority and make it request Gold objects.
- Store catalog and distribution metadata in JSON while keeping consequences as validated runtime behavior references.
- Preserve Babylon Lite ownership of collision, rendering, lighting, fog, minimap, realm transitions, and UI snapshots.
- Make seeded object distribution deterministic and cooperative with the existing generation scheduler.
- Support the exact object/log contract agreed during exploration.

**Non-Goals:**

- Do not expose object coordinates or mutable object state to React.
- Do not persist object state across browser refreshes.
- Do not make Torch or Stair objects collectible.
- Do not add a new dependency or replace the existing palette editor.
- Do not change realm-entry ownership: Realm System logs realm entry.

## Decisions

### One object authority with two behavior modes

Replace `createPickupSystem` with `createObjectSpawnerSystem` in `object-spawner-system.js`. The system stores immutable catalog metadata plus mutable per-instance object records. `IsPickup` controls one-time consumption; non-pickups remain active. A collision result includes object identity, type, cell, and consequence/log metadata so quest, log, health, gold, and minimap consumers can react without owning placement.

The alternative of leaving pickup and world-object stores separate was rejected because it would preserve duplicate placement rules and make object-layer precedence fragile.

### JSON catalog plus explicit runtime consequences

Add an object catalog JSON file beside `quest_data.json`. Each entry contains the agreed fields and distribution configuration: count range, minimum spacing, distance bands, candidate constraints, and paired-realm behavior. JSON remains declarative; the game layer maps approved consequence identifiers such as `gold:+1`, `health:+2`, `health:-2`, `torch-light`, and `realm-transition` to runtime behavior. This avoids serializing functions while keeping AI-authored spawn parameters editable.

The alternative of embedding all object metadata in JavaScript was rejected because it would prevent a single visible distribution contract and make later content tuning harder.

### Final object pass owns level-spawned placement

Extend the existing generation pipeline with `object-spawner` after `player-position`. The synchronous and cooperative world-generation paths use the same seeded placement primitives. The pass receives the final walkable terrain and player start, reserves cells as it places objects, and returns an explicit object layer. Paired Stairs remain a shared coordinate set valid in both realms.

### Preserve specialized placement constraints through catalog rules

Generic walkable-cell selection handles Hearts and Traps. Torch entries retain wall-adjacency and minimum-spacing constraints required by lighting. Stairs retain paired-realm validity. The Object Spawner System owns the common distribution loop while catalog rule identifiers select these verified candidate filters.

### Palette-driven glyphs and rendering

Object glyphs are resolved through the active palette at render time. The catalog uses `🪙`, red `♥`, `🕯️`, `☠`, and `S`; `🕯️` is added to palette data if absent. Replace the old `T` assumptions in glyph registration, world composition, minimap marker lookup, and lighting source lookup. The object layer takes character visibility precedence without mutating terrain walkability.

### Quest request boundary

`quest-system.js` continues to load `quest_data.json`, track progress, and publish quest snapshots. During quest startup, the game layer passes an Object Spawner System request containing the Gold catalog type and quest distances. Gold is not part of the final level-spawn pass because its `IsLevelSpawned` value is false.

### Logging ownership

The Object Spawner System emits configured pickup/effect log requests for the exact strings `Player collected +1 Gold from Gold`, `Player collected +2 Health from Heart`, and `Player lost -2 Health from Trap`. It emits no Torch or Stair log. The Realm System emits `Player entered the Underground Realm` for both initial entry and Stair transitions.

## Risks / Trade-offs

- [Risk] Renaming the system can leave stale imports or tests referencing `pickup-system.js` → update all runtime and mirrored test imports together and add a repository search check for the old module name.
- [Risk] Existing Torch requirements target `T` and approximately three Torches per zoom-5 screen → update the delta and verify lighting/minimap behavior with the new `🕯️` glyph and the agreed approximately 10–14-per-world initial range.
- [Risk] A large object catalog can increase generation work → use the existing cooperative checkpoints and bounded candidate scans.
- [Risk] Multiple objects can select one cell → reserve player, paired Stair, and already selected object cells and use deterministic conflict resolution.
- [Risk] Palette/font support for `🕯️` may vary → ensure the palette entry exists, validate glyph registration, and use the existing glyph cache path rather than a special renderer.
