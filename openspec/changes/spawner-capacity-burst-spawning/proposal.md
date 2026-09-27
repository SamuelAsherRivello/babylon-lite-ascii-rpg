# Proposal

## Why

Enemy spawners currently create only one enemy per cadence, regardless of how many of their previously spawned enemies are still alive. This makes spawner behavior predictable but does not express a bounded local population, so the spawner should instead refill toward a small per-spawner capacity in randomized bursts.

## What Changes

- Keep the initial spawn and recurring cadence at every 100 world-time ticks.
- Give each enemy spawner a maximum of three living enemies that it owns.
- Count only living enemies associated with that specific spawner when deciding whether to spawn.
- On each eligible cadence, choose a random burst bounded by the spawner's remaining capacity:
  - zero living enemies: 1, 2, or 3;
  - one living enemy: 0, 1, or 2;
  - two living enemies: 0 or 1;
  - three living enemies: 0.
- Preserve the existing eight-neighbor occupancy checks and no-deferred-backlog behavior for blocked spawn cells.
- Preserve each enemy's spawner ownership through enemy registration and lifecycle removal so dead enemies stop counting.
- Replace the stale enemy-spawner requirement and scenarios that describe a 30-tick, one-enemy cadence.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `enemy-spawner-system`: change enemy spawning from one enemy per cadence to bounded randomized bursts based on each spawner's living population and update the cadence contract to 100 world-time ticks.

## Impact

- Affects `enemy-spawner-system.js` and `enemy-system.js` runtime coordination.
- Updates focused enemy-spawner tests and the `enemy-spawner-system` OpenSpec delta.
- No new dependencies, renderer changes, save-format changes, or changes to NPC spawners are required.
