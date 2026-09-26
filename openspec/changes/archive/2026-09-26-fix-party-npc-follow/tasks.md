# Tasks

## 1. Portable Follow Behavior

- [x] 1.1 Inspect the current recruited-NPC simulation path and reconcile it with the party-follow spec without changing unrelated dirty work; verify the affected files and baseline focused tests are identified
- [x] 1.2 Implement collision-safe trailing-target selection for recruited NPCs at 3–5 cardinal units behind the player, including facing changes and blocked preferred cells; verify the companion advances at most one legal step per frame only when farther than 5 gridspots
- [x] 1.6 Add best-effort peer-spacing to portable candidate selection, preferring one empty grid cell between followers while retaining legal non-overlapping fallbacks
- [x] 1.3 Ensure recruitment clears ambient patrol progression and routes while preserving unrecruited NPC patrol behavior; verify with focused NPC system tests
- [x] 1.4 Preserve living recruited NPC identity and recruited state across stair-triggered realm replacement; verify party members are not regenerated as unrelated ambient NPCs
- [x] 1.5 Place each preserved party NPC in the new realm on a distinct nearest-to-stairs walkable, unoccupied cell, preferring 3–5 cardinal units from the player with a safe fallback; verify placement occurs before follow updates resume

## 2. Verification

- [x] 2.1 Add or update focused Node tests covering recruitment, per-frame catch-up, facing-relative following, blocked targets, no movement inside the 3–5-gridspot band, and no overlap; verify the focused test command passes
- [x] 2.2 Add focused Node tests covering stair transitions, identity/recruited-state preservation, nearest-to-stairs placement, blocked candidate retry, and distinct cells for multiple party NPCs; verify the focused test command passes
- [x] 2.6 Add focused portable behavior tests covering peer spacing, deterministic candidate ranking, and legal fallback when one-cell separation is impossible
- [x] 2.3 Run the repository test suite and production build from the repository root; verify `npm.cmd test` and `npm.cmd run build` pass
- [x] 2.4 Manually verify the live browser party dialog flow with an explicit `randomSeed`, enter stairs, confirm the same party NPCs appear randomly 3–5 cells around the player in the next realm, then move and turn the player and confirm they follow without overlap
- [x] 2.5 Validate the completed OpenSpec change strictly; verify `openspec validate fix-party-npc-follow --type change --strict` passes
