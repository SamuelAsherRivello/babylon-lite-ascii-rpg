# Tasks

## 1. Dependency and baseline readiness

- [ ] 1.1 Add `@esengine/pathfinding` to the root production dependencies and lockfile, verify its installed ESM exports, MIT license metadata, browser bundle, and a minimal non-diagonal A* grid route; reject the dependency's diagonal HPA* output from the public API before any consumer refactor.
- [ ] 1.2 Preserve the existing 33-FPS hasty baseline record for the exact in-app-browser sprint-right URL and verify the current performance monitor can produce a separately labeled sprint report without leaking world, seed, or storage data.

## 2. Shared navigation utility

- [ ] 2.1 Create `utilities/a-star-utility.js` as the only `@esengine/pathfinding` import boundary, exposing immutable deterministic cardinal exact-route, nearest-target, and bounded distance/reachability operations; add focused Node tests for paths, blockers, ties, and unreachable results.
- [ ] 2.2 Implement an internal cached 16-by-16 cardinal static-terrain sector graph and non-diagonal A* local refinement for distant routes; verify a barrier detour selects a reachable next-sector exit and a terrain/world revision invalidates stale cached connectivity.
- [ ] 2.3 Implement optional realm-qualified stair-mediated route plans while keeping realm-local mode the default; verify valid paired stairs yield ordered segments, missing connections are unreachable, and utility queries never move entities or transfer realms.

## 3. Route-consumer integration

- [ ] 3.1 Replace enemy-system local field construction and far Manhattan-greedy fallback with the utility while preserving action cadence, cardinal facing, combat, occupancy, same-realm pursuit, and cross-realm idling; verify focused enemy barrier and existing enemy-system tests.
- [ ] 3.2 Route NPC birth patrol creation and NPC-spawner 15/20-cell eligibility checks through the utility while preserving one-time deterministic route selection and stored reverse traversal; verify focused NPC and NPC-spawner tests.
- [ ] 3.3 Route minimap nearest stairs/key/door lookup and the game-layer nearest-stairs travel helper through the utility while preserving door-adjacent targeting, fog/marker output, discovery, and existing stair-transfer ownership; verify minimap, quest, and realm-route tests.
- [ ] 3.4 Route bounded building-key reachability through the utility without introducing a target-path requirement; verify building-system placement and reachability tests.

## 4. Verification and comparison

- [ ] 4.1 Run the focused utility and changed-consumer Node tests, then `npm run test` and `npm run build`; verify no React, bridge, gameplay tick, combat, or cross-realm-idling regressions.
- [ ] 4.2 Run `openspec validate add-hierarchical-pathfinding-utility --strict` and verify the utility's direct dependency boundary and all new/modified route contracts are represented by tests.
- [ ] 4.3 After implementation, fresh-reload the identical local URL and perform the same one-second Shift+Right sprint sequence, capture the HUD and structured sprint report, and record the before/after FPS and frame-time difference with the automation-environment limitation.
