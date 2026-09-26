# Design

## Context

See `proposal.md` and the NPC-spawner delta spec for the behavioral contract. The spawner currently chooses an adjacent spawn cell after checking whether that cell can support a 15-or-20-cell patrol based on the NPC's birth cell. NPC patrol construction then treats the birth cell as home and alternates a stored route to a random destination and its reverse. This can leave an NPC at a spawner-side cell instead of visibly travelling to and from the spawner.

Dynamic occupancy permits one occupant per cell, so an NPC cannot enter the NPC-spawner cell. NPC patrols already use the game's shared time ticks and route state; recruited-party behavior remains a separate state transition.

## Goals / Non-Goals

**Goals:**

- Establish one deterministic-random, reachable 10--15-cell initial endpoint per successful NPC spawn.
- Make ambient patrol route direction unambiguous: endpoint to the spawner approach, then reverse to the same endpoint indefinitely.
- Keep patrol generation bounded and compatible with deferred patrol preparation.

**Non-Goals:**

- Do not allow NPC and spawner co-occupancy, add NPC respawning, or change party-follow behavior.
- Do not add a setting, a tick source, a dependency, or route recalculation after initialization.

## Decisions

### Measure the spawn endpoint by cardinal path distance from the spawner

Build a distance field from the spawner using the existing walkability and static-occupancy constraints. Candidate endpoints are walkable, dynamically unoccupied cells at inclusive distance 10 through 15. Randomly select from those candidates using the spawner's existing seeded random source, and reject the setup spawn if no candidate can produce a route.

Using straight-line grid radius was considered and rejected: barriers could place an apparently valid endpoint on an unreachable or substantially longer route. Reusing the prior 15-or-20 distance from the adjacent birth cell was rejected because it does not meet the requested spawner-relative range.

### Treat the adjacent route terminus as the spawner approach

Create a complete route from the selected endpoint to a valid neighbor of the spawner, with the spawner itself used as the logical patrol anchor but never entered. The NPC-system route record will retain the selected endpoint, spawner identity or anchor cell, route steps, and a direction/index. On each normal ambient-patrol tick, it advances the stored route toward the approach, reverses there, and reverses again at the endpoint.

Allowing the NPC to enter the spawner cell was considered and rejected because it violates the existing single-cell dynamic-occupancy invariant. Stopping and reversing on a failed move into the spawner was rejected because it makes direction depend on contention rather than stored patrol state.

### Preserve one-time setup and static route selection

The spawner remains responsible for selecting the start endpoint and supplies the route anchors as part of NPC creation. The NPC system owns route construction/state and uses its existing synchronous or deferred preparation pathway to finish the initial route. A temporary dynamic blockage keeps the NPC in place for that tick without replacing its route or endpoint.

Moving selection to every tick was considered and rejected because it would be non-repeatable, cost pathfinding during play, and break the current stored-route model.

## Risks / Trade-offs

- [A constrained map has no endpoint 10--15 cells from a spawner] → Leave that spawner empty after its one setup attempt; never fall back to an adjacent NPC.
- [A selected endpoint's final approach becomes dynamically occupied] → Wait for the current tick and retain the route so the NPC resumes when the cell clears.
- [Deferred route setup can delay first visible movement] → Do not register ambient patrol steps until route initialization completes, and cover both immediate and deferred initialization in focused tests.
- [Existing tests encode the old home-to-destination contract] → Replace or adjust them to assert spawner-relative endpoint distance, approach reversal, repeat cycles, and no-qualifying-endpoint behavior.

## Migration Plan

1. Update NPC-spawner candidate selection and NPC patrol initialization/state to use the spawner-relative route anchors.
2. Update focused Node tests, then run the repository test suite and production build from the repository root.
3. Deploy as an in-memory gameplay behavior change; existing browser settings and saved data need no migration. A rollback restores the prior spawn/patrol initialization behavior.
