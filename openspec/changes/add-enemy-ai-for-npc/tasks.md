# Tasks

## 1. Target Selection and Enemy Simulation

- [x] 1.1 Add a deterministic same-realm living-target query for the player and NPCs, excluding dead or unreachable actors; verify nearest-path and tie-break unit tests pass.
- [x] 1.2 Update eligible enemy movement to route toward the selected NPC or player while preserving one-step cadence, terrain checks, occupancy exclusivity, facing, and cross-realm idling; verify focused enemy-system tests pass.
- [x] 1.3 Resolve adjacent attacks against the selected target through the existing player and NPC damage callbacks, including target-specific logs and target switching after death; verify attack and retargeting tests pass.

## 2. NPC Damage and Death Integration

- [x] 2.1 Reconcile NPC ordinary-damage handling with the existing Bomb damage path so enemy damage clamps health, removes zero-health NPCs from occupancy, unregisters future ticks, and preserves follow/patrol behavior for living NPCs; verify focused NPC-system tests pass.
- [x] 2.2 Wire the game-layer enemy/NPC callbacks and rendered health updates without moving gameplay state into React; verify integration tests cover ambient and recruited NPC targets.

## 3. Verification

- [x] 3.1 Run the focused enemy, NPC, combat, occupancy, and health-bar Node tests and verify they pass without changing unrelated behavior.
- [x] 3.2 Run `npm.cmd test` and `npm.cmd run build` from the repository root and verify both complete successfully.
- [x] 3.3 Run `openspec validate add-enemy-ai-for-npc --type change --strict` and verify the change validates.
- [x] 3.4 Manually verify a browser session with an explicit `randomSeed`: NPC follow behavior remains unchanged, a stationary player advances no enemy action, four player-driven ticks produce exactly two enemy eligible actions, an enemy attacks the nearer NPC or player, NPC health decreases, the NPC disappears at zero health, and the enemy retargets the remaining living target.
