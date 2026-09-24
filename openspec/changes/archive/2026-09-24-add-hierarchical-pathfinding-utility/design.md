# Design

## Context

See `proposal.md` for motivation and the navigation-utility delta for the contract. Route search is currently split between the enemy distance field, NPC patrol generation and spawn validation, minimap target lookup, nearest-stairs travel, and building-key placement. The game is JavaScript ESM, uses `{ x, y }` cells, permits cardinal movement for autonomous entities, and has paired same-coordinate stairs in its two generated realms.

## Goals / Non-Goals

**Goals:**

- Keep one game-layer-only adapter as the sole import site for `@esengine/pathfinding`.
- Give every current route-search consumer one deterministic cardinal API while preserving its distinct caller policy.
- Use 16-by-16 static-terrain sectors for distant navigation, then exact refinement for a local target area.
- Support an explicitly requested multi-realm route as ordered, non-executing segments joined only by paired stairs.
- Produce comparable before/after hasty sprint-right evidence without adding a new browser test framework.

**Non-Goals:**

- No React route state, new HUD, automatic entity transfer, cross-realm enemy pursuit, diagonal autonomous movement, dynamic-agent avoidance system, or change to player input/tick/combat rules.
- No guarantee that a coarse distant segment is globally cell-optimal before local refinement.
- No replacement of fog, lighting, world-generation flood fills, or other non-navigation graph work.

## Decisions

### A dependency-isolating static adapter

Create `ascii-rpg/src/client/game-layer-babylon-lite/utilities/a-star-utility.js` as a static `AStarUtility` facade. It converts the game's `{ x, y }`, terrain, static blockers, realm identities, and paired stairs into the dependency's non-diagonal grid A* input and converts the result back into immutable game cells. Gameplay systems must not import `@esengine/pathfinding` directly.

The facade supplies exact same-realm routes, bounded cardinal distance/reachability fields, nearest-target selection, and hierarchical route segments. It uses normal object values at its boundary even though the dependency publishes TypeScript declarations, because this project is JavaScript ESM.

Alternative considered: importing the dependency independently in each system. Rejected because it would duplicate coordinate conversion, deterministic tie policy, terrain invalidation, and dependency API coupling.

### Preserve the distance-field shape for multi-actor consumers

The enemy, NPC, NPC-spawner, and building workflows currently query many cells against one target or origin. The utility will expose a distance-field/reachability operation in addition to start-to-goal routes, preserving the efficient single-search shape instead of issuing a full A* request per candidate. The implementation may use the library's supported planner where it preserves the required cardinal deterministic result; the adapter owns any minimal conversion needed to retain the field contract.

Alternative considered: replace every search with one exact A* request. Rejected because patrol candidate scans, spawn validation, and building-key selection would become unnecessarily repetitive.

### Hierarchical routing is for distant same-realm enemy pursuit

The adapter partitions static terrain into 16-by-16 sectors, caches valid cardinal inter-sector exits per realm/terrain revision, and uses its own deterministic cardinal sector graph when the enemy and player are outside the local refinement area. The next movement target is a reachable cardinal exit in the next coarse sector, not a direct Manhattan step. Near the player, the existing exact cardinal distance-field behavior remains the movement chooser so many enemies can share it per tick. Exact route refinement uses the dependency's verified non-diagonal A* calls.

The adapter invalidates static-sector data whenever a caller supplies a new realm/world identity or terrain revision, including after terrain-changing gameplay. Dynamic occupancy remains a per-query blocker and does not invalidate the static sector cache.

Alternative considered: use the dependency's HPA* output for the coarse graph. Rejected because version 15.0.1 returned diagonal cells despite its grid being configured with `allowDiagonal: false`; allowing that result through would violate the game contract. The utility's sector graph keeps all externally observable routes cardinal-only.

### Cross-realm routes are explicit plans, not execution

The facade accepts realm-qualified endpoints and `allowCrossRealm: true`. It treats a valid paired stair as a graph edge, returns source-realm cells, an explicit stair transition record, and destination-realm cells, but never changes active realm, discovery, player position, or entity occupancy. Existing callers continue to use the default realm-local mode; specifically, enemy cross-realm idling remains unchanged.

Alternative considered: automatically transfer an entity when its route reaches stairs. Rejected because the realm transition system owns active-world presentation and player transfer, while enemies are explicitly specified to idle across realms.

### Consumer-specific policy stays with each system

- `enemy-system` requests a deterministic route/field while retaining cadence, attack checks, facing updates, and occupancy moves.
- `npc-system` creates one birth-time route and retains the saved forward/reverse patrol policy.
- `npc-spawner-system` asks the utility only whether a prospective birth cell has a valid 15- or 20-cell patrol route.
- `minimap-renderer` uses nearest reachable route selection but retains target eligibility, door-adjacent semantics, fog, and marker rendering.
- the game-layer nearest-stairs helper uses the utility's exact route but keeps transfer, discovery, and UI behavior at its current owner.
- `building-system` uses bounded reachability only; it does not need a full target route.

### Hasty benchmark protocol is evidence, not a release threshold

The pre-change run is recorded as 33 FPS from the existing HUD after a one-second automated sprint-right sequence in the in-app browser at `http://127.0.0.1:5178/babylon-lite-ascii-rpg/?skipTutorial=true&performance=sprint`. During apply, run the same URL, viewport, zoom, camera settings, and one-second Shift+Right input after a fresh reload; capture the existing structured performance report when available and compare FPS/frame timing alongside the HUD. The result is scoped to that automation environment and will not be generalized to a foreground-user FPS claim.

## Risks / Trade-offs

- [The selected dependency's published API or licensing may not match its documentation] → Verify its installed exports, MIT license metadata, browser build, and smallest non-diagonal A* route before refactoring consumers; reject any dependency route output containing a diagonal step.
- [A cached coarse graph can become stale after a mountain is dug] → Bind cache entries to an explicit terrain revision/world identity and test invalidation.
- [HPA can choose a near-optimal rather than globally exact distant path] → Expose it only as coarse direction; use exact local refinement and do not label the pre-refinement route shortest.
- [Consumer conversion changes a tie or target rule] → Keep caller-level policies outside the adapter and port focused existing tests before deleting duplicate code.
- [Automation timing underruns normal foreground rendering] → Label both benchmark samples with the exact URL and environment and compare only like-for-like samples.

## Migration Plan

1. Add and validate the dependency, then add the adapter and focused utility tests without changing existing callers.
2. Port consumers one at a time, retaining their existing tests and adding regression coverage for barrier detours, target rules, and route persistence.
3. Run the focused suite, full existing Node suite, production build, strict OpenSpec validation, and the matching post-change sprint-right sample.
4. Roll back by removing the adapter dependency and restoring the prior per-system searches in a follow-up change; no persisted data or server migration is involved.
