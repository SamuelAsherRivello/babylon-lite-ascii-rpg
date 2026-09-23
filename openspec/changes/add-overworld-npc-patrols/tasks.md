# Tasks

## 1. NPC domain and deterministic generation

- [x] 1.1 Add palette-backed `☺` NPC and NPC-spawner glyph constants and focused palette/world inventory tests that verify editable palette coverage.
- [x] 1.2 Revise deterministic Overground-only NPC-spawner selection to create exactly 4/8/12 walkable, unoccupied cells for Low/Med/High NPC density, each with one reachable within 50 cardinal cells of player start; verify seed stability, realm scope, proximity, density, and occupancy exclusions.
- [x] 1.3 Revise the NPC Spawner System to create at most one nearby walkable NPC during setup and never register or act on later ticks; verify valid placement, blocked setup handling, and permanent population cap.

## 2. Friendly patrol and occupancy behavior

- [x] 2.1 Revise NPC patrols to compute and store one 15-or-20-cell cardinal route at birth, consume it one step per received tick, and reverse it home without later pathfinding or randomization; verify focused route tests.
- [x] 2.2 Integrate NPCs with existing Overground dynamic occupancy and rendering; verify focused tests cover walkability-only routes, temporary occupied-cell waits, and preservation of terrain/static layers.
- [x] 2.3 Extend player collision dispatch so NPC cells block movement without combat, damage, stamina, experience, logging, or new time advancement; verify focused movement/combat tests cover cardinal and diagonal NPC collisions.

## 3. Generation integration

- [x] 3.1 Add a persisted, clearly labeled `NPC` Procedural menu pass with visible Low/Med/High choices and Med default; show density-matched prominent NPC markers on the Overground preview map; verify the generation-settings catalog, local-storage migration, and UI presentation.
- [x] 3.2 Rewire NPC systems into game-layer startup for the selected 4/8/12-spawner, one-time spawn model without changing time-system producers or existing enemy behavior; verify focused time, NPC, and enemy tests preserve the shared tick contract.

## 4. Rendering culling

- [x] 4.1 Apply per-surface source-region and matching-fog culling to game, minimap, and developer map-view glyphs, overlays, effects, and markers; verify focused rendering tests cover fogged and off-region NPCs/spawners plus existing graphic types.

## 5. Verification

- [ ] 5.1 Run the relevant focused Node tests for NPC systems, dynamic occupancy, player movement/combat, palette, generation settings, time, and rendering culling; verify all pass.
- [x] 5.2 Run `npm.cmd test` and `npm.cmd run build` from the repository root; verify the production build and existing test suite pass, or record unrelated pre-existing failures separately. `npm.cmd test` currently has seven failures outside this change: four palette-count expectations still expect 301 rather than the current 302 entries, the world glyph inventory omits the concurrent fireplace glyph, and two existing UI copy contracts no longer match the shared workspace.
- [ ] 5.3 Manually verify regenerated Overground worlds in the browser: the `☺` glyph is color-editable in Ascii Settings; the clearly visible NPC Low/Med/High selection creates at most 4/8/12 NPCs; NPCs patrol and return over player-driven ticks; and player/NPC collision is non-combat.
