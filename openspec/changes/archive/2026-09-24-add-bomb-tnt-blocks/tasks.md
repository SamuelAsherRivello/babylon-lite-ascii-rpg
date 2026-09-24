# Tasks

## 1. Inventory state and SPACE action

- [x] 1.1 Add the stackable bomb item to new character state with a count of 50, include its count in the immutable character snapshot, and render the fourth inventory cell with the bomb glyph and count; verify focused character-state, bridge, and character-panel tests cover initial, decremented, and zero counts.
- [x] 1.2 Extend inventory capability resolution to handle non-directional gameplay actions, route non-repeating SPACE input to the `bomb` capability, and reject use at zero count; verify focused resolver and player-input tests cover the available, depleted, repeated-key, gameplay-input-locked, and failed-placement time cases.
- [x] 1.3 Normalize the health bridge snapshot against the new 125-point maximum while preserving its 0–100 HUD contract; verify focused bridge and character-panel tests cover `125 / 125` as `100%` and `25 / 125` as `20%`.

## 2. Bomb placement and presentation

- [x] 2.1 Add a bomb-specific planted-cell registry separate from exclusive character occupancy, consume one item only after a successful placement, and reject duplicate bombs in a cell; verify focused bomb-system tests cover placement, overlapping the player, movement over a bomb, and rejected placement without item loss.
- [x] 2.2 Render planted bombs with `●` and active blast cells with `✶`, preserving actor glyph priority and invalidating changed cells; verify focused rendering tests cover bomb visibility after the player leaves and each growing blast ring.

## 3. Tick-driven fuse, blast, and chaining

- [x] 3.1 Advance world time once for successful placement, arm the fuse at the resulting time without counting the placement tick, and register bomb fuse and blast work with the global world-time tick path for both realms; verify focused tick tests cover the placement tick, five later fuse ticks, inactive-realm progression, paused world time, and each ring's Euclidean cell set.
- [x] 3.2 Trigger a bomb on the next world-time tick after another blast first reaches it, independent of its remaining fuse, and deduplicate repeat contacts; verify focused chain tests cover early fuse interruption and simultaneous blast contacts.
- [x] 3.3 Resolve the bomb phase before player, enemy, and NPC movement/actions on each tick, prevalidating time-consuming player actions so a lethal blast cancels pending movement or attacks; verify controlled tick-order tests cover player, enemy, and NPC targets and blocked movement advances neither time nor bomb state.

## 4. Health damage and target lifecycle

- [x] 4.1 Apply 100 bomb damage to newly reached mountains, enemies, and enemy spawners through existing health paths; verify focused damage tests cover actual damage clamped to current health, zero-health cleanup, grass conversion, spawner unregistration, and unchanged non-diggable terrain.
- [x] 4.2 Add 100 / 100 health and bomb-damage/death handling for NPCs and NPC spawners while preserving non-combat patrol behavior and allowing a spawned NPC to outlive its spawner; verify focused NPC and NPC-spawner tests cover damage, death/unregistration, and the surviving-spawned-NPC case.
- [x] 4.3 Route bomb damage through player Defense and Shield durability, raise starting and maximum health to 125, and retain the existing one-time death path for subsequent lethal hits; verify focused player and combat-stat tests cover 100 damage without Defense leaving 25 health and full Defense with Shield applying 50 health and 50 Shield damage.

## 5. Integration and delivery checks

- [x] 5.1 Run focused bomb, inventory, time, input, terrain, enemy, spawner, NPC, player-lifecycle, combat-stat, bridge, and rendering tests; verify fuse timing, ring growth, chain ordering, damage amounts, target cleanup, player survival, and HUD snapshots match the specification.
- [x] 5.2 Run `npm.cmd test`, `npm.cmd run build`, `git diff --check`, and `openspec validate add-bomb-tnt-blocks --type change --strict`; record results and distinguish any unrelated existing failures.
- [ ] 5.3 Manually verify with an explicit `randomSeed` that SPACE places one bomb at the player cell and advances time once, the count starts at 50 and decrements, the player can escape between ticks, the five-tick fuse and five blast rings advance on global later world ticks in either realm, blasts resolve before actor movement, and chained bombs detonate one tick after contact.

## Verification Results

- Focused bomb, inventory, input, tick, combat, NPC, player-lifecycle, bridge, and presentation tests: 107 passed.
- `npm.cmd test` with the available Node 24 runtime: 418 passed, 8 failed. The failures are existing generation-reference and template/documentation assertions outside this feature's changed test files.
- `npm.cmd run build`: passed; Vite reported its existing large-chunk advisory.
- `git diff --check` and strict OpenSpec change validation: passed.
- Manual browser verification remains pending because the browser security policy rejected opening the local verification tab.
