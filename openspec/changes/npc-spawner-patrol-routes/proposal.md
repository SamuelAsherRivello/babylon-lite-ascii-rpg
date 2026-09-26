# Proposal

## Why

NPCs can remain beside their NPC spawner indefinitely because their current patrol begins from a cell adjacent to the spawner and can fail to form a route. Give every successfully created NPC a meaningful, visible default route that starts away from its spawner and repeatedly returns to it.

## What Changes

- Select each spawned NPC's initial patrol endpoint from reachable, walkable, unoccupied cells that are 10 through 15 cardinal path cells from its originating NPC spawner.
- Spawn the NPC at that selected endpoint, then store a route that moves it to the spawner and back to the same endpoint repeatedly during its default patrol.
- Preserve the existing one-NPC-per-spawner, terrain/occupancy blocking, and no-repathing-after-initialization behavior.
- Leave a spawner empty when no qualifying 10--15-cell endpoint and route can be established during setup, rather than creating an NPC beside it with no patrol.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `npc-spawner-system`: Change friendly NPC spawning and default patrol requirements so an NPC starts 10--15 cardinal path cells from its spawner and continuously traverses the stored endpoint-to-spawner route in both directions.

## Impact

- Affected runtime systems: `ascii-rpg/src/client/game-layer-babylon-lite/systems/npc-spawner-system.js` and the NPC patrol implementation it initializes.
- Affected validation: focused NPC-spawner system Node tests, followed by the repository test and build checks.
- No new dependencies, public APIs, settings, renderer changes, or browser-storage changes.
