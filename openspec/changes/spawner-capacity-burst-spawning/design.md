# Design

## Context

The current enemy spawner registers a tickable that performs one neighboring-cell spawn at world time `1` and every 100 ticks afterward. The spawn request already carries a `spawnerId`, but enemy registration does not retain it on the authoritative enemy record. See the proposal and the enemy-spawner-system spec delta for the required behavior.

## Goals / Non-Goals

**Goals:**

- Make each enemy spawner refill only its own living population up to three enemies.
- Keep the existing deterministic time system, seeded random source, eight-neighbor placement rules, occupancy exclusivity, and no-backlog behavior.
- Keep enemy and spawner lifecycle responsibilities separated while exposing enough ownership data for the spawner to count living enemies.

**Non-Goals:**

- No changes to NPC spawner behavior.
- No global enemy population cap.
- No change to enemy AI, combat, rendering, world-generation placement, or save migration.

## Decisions

### Count owned live enemies from authoritative occupancy

The spawner system will derive its count from the authoritative dynamic occupancy records, filtering for enemy type, matching `spawnerId`, and positive health. The enemy system will preserve `spawnerId` when it claims an enemy record. This avoids adding a second population registry that could become stale when enemies die or are removed.

An alternative would be to add explicit spawn/death callbacks between the systems. That would make counting cheaper, but it would duplicate lifecycle state and require every enemy removal path to maintain the callback correctly.

### Use remaining capacity to bound a random burst

At each eligible time, compute `remaining = 3 - livingOwned`. When `livingOwned` is zero, choose a requested burst uniformly from 1 through 3. Otherwise choose uniformly from 0 through `remaining`. Execute that many normal neighboring-cell spawn attempts in sequence, rechecking occupancy and current live count after each successful spawn.

This preserves the requested nonzero initial burst while allowing later refills to produce no new enemy when the spawner is partially populated. Sequential attempts ensure that a burst cannot exceed capacity even if the spawn callback updates occupancy immediately.

### Reuse the existing per-spawner random stream

The existing `randomFor(spawner, time)` contract remains the source of seeded randomness. The returned random function will be consumed for burst-size selection and neighboring-cell shuffling, so identical spawner/time inputs remain reproducible. No dependency or new random implementation is needed.

### Keep cadence and failure semantics in the spawner system

The tickable continues to check world time `1` and then each 100-unit boundary. A blocked or partially successful burst is resolved immediately against current occupancy; missed capacity is not stored as a pending backlog. Spawner destruction still unregisters its tickable, while already-created enemies remain independently owned and alive until their normal death lifecycle.

## Risks / Trade-offs

- [Risk] A burst can request more enemies than there are valid neighboring cells. → Each attempt reuses the current candidate filter and stops naturally when no valid cell remains; no deferred backlog is retained.
- [Risk] Occupancy records without a preserved `spawnerId` would appear unowned and never count. → Add focused tests that assert ownership survives enemy registration and that enemy death restores capacity.
- [Risk] Consuming the seeded random stream for burst size changes later neighbor selection relative to the old implementation. → Update deterministic expectations in focused spawner tests and keep all randomness scoped to the same spawner/time stream.
