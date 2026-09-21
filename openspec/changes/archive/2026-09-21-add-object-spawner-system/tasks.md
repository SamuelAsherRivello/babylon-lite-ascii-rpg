# Tasks

## 1. Object Catalog and System Boundary

- [x] 1.1 Create the JSON object catalog with Gold, Heart, Torch, Trap, and Stairs entries, exact `IsPickup`/`IsLevelSpawned` values, glyphs, consequence identifiers, exact log text, and initial 10–14 level-spawn ranges; verify the JSON parses and every glyph is accounted for.
- [x] 1.2 Rename the runtime module boundary from `pickup-system.js` to `object-spawner-system.js` and update mirrored test imports; verify repository search finds no stale runtime import of `pickup-system.js`.
- [x] 1.3 Implement catalog validation, object registration, immutable snapshots, seeded placement, reserved-cell handling, and collision events; verify unit tests cover invalid glyphs, duplicate cells, deterministic placement, pickup consumption, and persistent objects.

## 2. Palette and Rendering Integration

- [x] 2.1 Add or customize palette entries and colors for `🪙`, red `♥`, `🕯️`, `☠`, and `S`; verify palette validation and glyph-cache registration accept every catalog entry.
- [x] 2.2 Replace `T` rendering and lighting references with the `🕯️` Torch object while preserving walkability and lighting-source behavior; verify rendering and lighting tests cover the new glyph.
- [x] 2.3 Render object-layer glyphs above terrain without changing terrain or walkability; verify world-view tests cover Heart, Trap, Torch, and Stair visibility and player precedence.

## 3. World Generation and Distribution

- [x] 3.1 Add the Object Spawner System as the final synchronous and cooperative world-generation phase after player placement; verify generation pass order and cancellation/checkpoint behavior.
- [x] 3.2 Move Heart, Torch, Trap, and paired Stair placement into the object-spawner phase with their catalog-specific candidate rules; verify seeded realm generation produces valid deterministic object sets and paired Stair coordinates.
- [x] 3.3 Replace the standalone Torch count/distribution contract with the catalog's approximately 10–14-per-world zoom-5 target and preserve wall adjacency/minimum spacing; verify the updated torch placement tests.
- [x] 3.4 Update minimap markers, fog gating, and lighting-field inputs to consume centralized object state; verify quest-owned Gold markers remain correct after movement, collection, and rerender while other object types remain unmarked.

## 4. Quest, Collision, and Logs

- [x] 4.1 Keep `quest-system.js` as the quest authority and make Collect Gold request exactly three Gold objects from `object-spawner-system.js` at the configured distances; verify quest setup no longer directly places Gold.
- [x] 4.2 Implement Gold, Heart, and Trap consequences with exact log strings and health/gold snapshot updates; verify `Player collected +1 Gold from Gold`, `Player collected +2 Health from Heart`, and `Player lost -2 Health from Trap` are emitted with the configured values.
- [x] 4.3 Preserve Torch non-interaction and remove Stair object logs; verify the Realm System alone emits `Player entered the Underground Realm` for initial entry and Stair transition.

## 5. Verification and Regression Checks

- [x] 5.1 Update mirrored unit tests for the object-spawner-system API, quest integration, world generation, palette, rendering, lighting, minimap, and logs; verify the focused Node test set passes.
- [x] 5.2 Run the repository's documented `npm.cmd test` and `npm.cmd run build` checks; verify no stale `T`, pickup-system, or direct Gold-placement assumptions remain in source and tests.
- [x] 5.3 Manually verify the running game shows red palette-driven Hearts, candle-glyph Torches, persistent Traps, paired Stairs, quest-requested Gold, exact logs, and no React access to object coordinates.
