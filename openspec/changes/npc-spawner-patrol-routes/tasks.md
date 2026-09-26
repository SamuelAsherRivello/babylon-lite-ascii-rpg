# Tasks

## 1. Spawner-relative patrol initialization

- [x] 1.1 Replace adjacent NPC spawn selection with seeded selection of a reachable, walkable, unoccupied endpoint at an inclusive 10--15 cardinal path distance from its NPC spawner; verify a qualifying setup spawn starts in that range and a nearby-only map leaves the spawner empty.
- [x] 1.2 Pass the selected endpoint and originating-spawner anchor into NPC creation while preserving one setup attempt per spawner; verify later world-time ticks never create another NPC.

## 2. Repeating ambient patrol route

- [x] 2.1 Update NPC default-patrol route preparation and state so a spawned NPC travels from its initial endpoint to a valid spawner-approach cell, reverses to the same endpoint, and repeats; verify the focused NPC-spawner tests observe both turns and a second outbound leg.
- [x] 2.2 Preserve blocked-step waiting, static walkability constraints, deferred route preparation, and recruited NPC follow behavior; verify focused tests cover a blocked route step and existing party-follow tests continue to pass.

## 3. Validation

- [x] 3.1 Update `ascii-rpg/test/client/game-layer-babylon-lite/systems/npc-spawner-system_tests.mjs` for the spawner-relative 10--15-grid endpoint, no-endpoint failure, and perpetual round-trip behaviors; verify with its focused Node test command.
- [x] 3.2 Run `npm.cmd test` and `npm.cmd run build` from the repository root; verify both complete successfully.
- [x] 3.3 Run `openspec validate npc-spawner-patrol-routes --type change --strict`; verify the change artifacts validate cleanly.
