# Tasks

## 1. Tick and Dynamic Occupancy Foundations

- [x] 1.1 Extend Time System tests for structured `time`/`cause` events, stable registration order, startup time-1 dispatch, newborn-next-tick behavior, and removal during dispatch; verify the focused Time System test file fails before implementation and passes afterward.
- [x] 1.2 Implement tickable registration, unregistration, current-time startup dispatch, and deterministic snapshot-based broadcast in `time-system.js`; verify existing time formatting/subscription behavior and the new focused tests pass.
- [x] 1.3 Add a realm-local dynamic occupancy module with stable entity IDs, exclusive cell claims, movement, lookup, and removal; verify focused tests cover duplicate claims, moves, and revealing an emptied cell.
- [x] 1.4 Integrate player occupancy with the realm-local index while preserving terrain, objects, stairs, camera modes, and realm transfers; verify focused world/player tests demonstrate no duplicate player glyph authority.

## 2. Enemy Spawner Distribution and Lifecycle

- [x] 2.1 Add focused failing tests for Underground-only seeded 4x4-region distribution, the 16-spawner cap, exclusion of player/object/civilization cells, and no Overground spawners; verify the tests fail for the missing system.
- [x] 2.2 Implement the Enemy Spawner System's deterministic normal distribution after civilization placement and store spawner records in Underground dynamic state; verify repeated seeds produce identical valid cells.
- [x] 2.3 Implement the explicit development/test bonus option with one additional valid spawner at Euclidean distance at most 5 from the Underground player start and production default `false`; verify focused tests cover enabled, disabled, and constrained-candidate cases.
- [x] 2.4 Implement spawner identity, 100 health, birth time, time-1 startup spawn, 30-unit cadence, and permanent unregistration at zero health; verify focused tests cover times 1, 31, 61, skipped intervals, and no post-death spawn.
- [x] 2.5 Implement deterministic eight-neighbor spawn selection with walkability/static/dynamic occupancy checks and no deferred backlog; verify focused tests cover a single valid candidate, deterministic multiple candidates, and all-blocked attempts.

## 3. Enemy Simulation and Navigation

- [x] 3.1 Add focused failing Enemy System tests for red `E` identity, 100 health, `bornAtTime`, derived age, no action before age 2, and even-age action cadence; verify the tests fail before implementation.
- [x] 3.2 Implement enemy creation, tick registration, age eligibility, health mutation, death, and unregistration; verify focused lifecycle tests pass for enemies born at multiple world times.
- [x] 3.3 Implement one reverse cardinal distance field per applicable same-realm tick with deterministic tie-breaking and civilization-aware walkability; verify focused path tests route around walls/closed doors and reject unreachable targets.
- [x] 3.4 Implement one-step enemy movement through dynamic occupancy, blocked-actor waiting, inactive-realm simulation, and no cross-realm target movement; verify tests cover offscreen/inactive ticking and exclusive cells.
- [x] 3.5 Integrate initial and repeating spawned enemies into both realm state and tick dispatch without a global population cap; verify a multi-cadence test keeps earlier enemies independently active.

## 4. Collision Combat, Health, and Logging

- [x] 4.1 Change authoritative initial player health and initial Character HUD health from 80 to 100 while retaining maximum 100 and existing death semantics; verify player-lifecycle and Character data tests pass.
- [x] 4.2 Resolve cardinal and diagonal player movement into enemies/spawners as a base 20-damage combat action that keeps both cells fixed and advances one `combat` tick; verify focused movement tests cover nonlethal, lethal, and later entry into the vacated cell.
- [x] 4.3 Resolve eligible cardinal enemy movement into the player as a 5-damage attack through Player Lifecycle; verify tests cover health snapshots, zero clamping, one-time death, and no shared cell.
- [x] 4.4 Submit combat and death messages through Log System for player-to-enemy, player-to-spawner, enemy-to-player, enemy death, and permanent spawner death; verify ordered snapshots contain one line per event with signed damage coloring left to the existing UI policy.
- [x] 4.5 Reconcile tick causes with the active stamina contract so combat ticks do not masquerade as successful movement or grant movement-only recovery; verify the combined focused time/movement/stamina tests when that change is present, and otherwise verify the cause contract independently.

## 5. Glyph and Health-Bar Presentation

- [x] 5.1 Change the existing `E` and `S` palette entries to the selected red base color and register both glyphs in the project map inventory; verify palette validation and glyph-cache tests resolve each identity.
- [x] 5.2 Update visible-cell composition to resolve player, dynamic enemy/spawner, static object/civilization, and terrain precedence without stale `world.characters` restoration; verify world-view, minimap, fog, lighting, and realm-transition tests remain green.
- [x] 5.3 Add a pure health-bar presentation model for proportional current fill, a lighter 300 ms latest-damage delta, 100 ms fade-in, 1,000 ms latest-damage hold, 100 ms fade-out, repeated-damage reset, offscreen filtering, and player exclusion; verify focused timing tests at phase boundaries.
- [x] 5.4 Add the dedicated Babylon Lite health-bar overlay atlas/layer, three-color interior sprites plus outline, one-cell-wide quarter-cell-high mockup geometry, cell-centered positioning, and bounded RAF continuation; verify renderer tests cover layer order, segment geometry, sprite reuse/hiding, resize/zoom updates, and disposal.
- [x] 5.5 Wire enemy/spawner previous and current health through damage timestamps and rerender scheduling without adding health bars to the minimap or player; verify focused integration tests cover onscreen damage, realm hiding, offscreen state, repeated damage, and re-entry while the bar is still active.

## 6. Integrated Verification

- [x] 6.1 Run focused enemy, spawner, time, occupancy, combat, world-generation, rendering, palette, and lifecycle Node tests from the npm project root and verify every targeted test passes.
- [x] 6.2 Run `npm.cmd test` and `npm.cmd run build` from the repository npm root, report unrelated failures separately, and verify no change-attributable failure remains.
- [x] 6.3 Run `openspec validate "add-spawning-system-add-enemy-system" --strict` from the repository root and verify every proposal/spec/design/task contract is valid.
- [x] 6.4 Manually verify the running app without creating or executing Playwright tests: confirm Underground-only normal spawners, the local nearby bonus, time-1 and 30-unit spawning, age-2 movement, offscreen/other-realm simulation, player 20-damage and enemy 5-damage collision combat, permanent death, exact logs, red `E`/`S`, and the mockup-matched three-color damage health-bar timing at the verified local URL.
