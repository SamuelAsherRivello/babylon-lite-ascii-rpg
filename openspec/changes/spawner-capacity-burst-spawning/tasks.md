# Tasks

## 1. Preserve Enemy Ownership

- [x] 1.1 Retain `spawnerId` on authoritative enemy records when enemies are registered, and verify ownership is present in focused enemy-spawner lifecycle tests
- [x] 1.2 Confirm enemy removal on death makes the enemy disappear from the spawner's live population, verified by a capacity-refill test

## 2. Implement Capacity-Bounded Bursts

- [x] 2.1 Add the per-spawner maximum of three living enemies and calculate each spawner's current owned living population from authoritative occupancy, verified by unit tests with multiple spawners
- [x] 2.2 Replace the single-enemy cadence attempt with the specified random burst ranges at world time 1 and every 100 ticks, verified for empty, partially populated, and full spawners
- [x] 2.3 Preserve sequential eight-neighbor occupancy checks and no-backlog behavior for multi-enemy bursts, verified when neighboring cells are partially or fully blocked

## 3. Update Contract Tests and Documentation

- [x] 3.1 Update enemy-spawner focused tests from the old one-enemy cadence expectations to the three-enemy capacity and burst rules, and verify deterministic random sequences remain reproducible
- [x] 3.2 Validate the OpenSpec change and confirm the delta replaces the stale 30-tick requirement without changing placement, damage, or destruction requirements

## 4. Verify Integration

- [x] 4.1 Run the focused enemy, spawner, combat, and time-system Node tests and verify they pass
- [x] 4.2 Run the repository test suite and build, then manually verify a seeded browser session loads successfully; rely on the focused simulation tests for the three-enemy refill cap
