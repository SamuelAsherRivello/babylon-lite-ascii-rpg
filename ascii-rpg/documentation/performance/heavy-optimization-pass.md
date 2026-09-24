# Heavy optimization pass — implementation evidence

Status: partial implementation, not production performance acceptance. Updated 2026-09-24.

## Scope and invariants

Baseline revision: `046fb3a4f5e122dd48d4dcb460b72d2457ed9409` on `main`.
No generation algorithm or positive-count random distribution was intentionally changed.
Three 128-square fixtures (`optimization-open`, `optimization-water`,
`optimization-obstructed`) retain SHA-256 reference outputs for both realms,
including terrain, starts, objects, stairs, homes/keys, civilization, spawners,
and a synchronous NPC patrol. References were captured before implementation and
rechecked repeatedly after edits. The fixture and capture command are under
`ascii-rpg/test/performance/`; reference assertions run in `npm.cmd test`.

Normal production uses all applicable layers and Med defaults; explicit saved
density/size choices remain valid. Development, or an explicit
`generationDiagnostics=true` session, permits disabling layers. A raw
`worldGenerationLayersEnabled` query does not disable production content by itself.

Each game/minimap/mapview resolves world contents only for positive fog visibility
inside its own source rectangle. Hidden dirty slots still receive clearing work
to remove formerly visible contents. This is not permission to stop offscreen
simulation or omit lights whose influence reaches visible cells. The generation
preview intentionally uses its own fully revealed diagnostic map, not live actors.

## Layer inventory and dependency audit

```text
World Settings: Low 128 / Med 256 / High 512, two realms
|-- Ground [required]
|-- Overground Walls
|-- Underground Caves
|-- Water
|   `-- Lake growth -> depth bands -> walkability
|-- Walkability [required]
|   `-- Largest connected region -> pruning / retries
|-- Player Position [required]
|-- Object Distribution
|   |-- Heart
|   |-- Chest
|   |-- Trap
|   |-- Torch
|   `-- Fireplace [Underground]
|-- Civilization Placement
|   |-- Stairs [paired, both realms]
|   |-- Doors [Underground]
|   |   `-- Runs / fences / doors / keys
|   `-- Homes [Overground]
|       `-- Footprint / walls / roof / interior / door / exterior key
`-- Character Distribution
    |-- Enemy Spawners [Underground]
    |   `-- Initial enemies / later simulation
    `-- NPC Spawners [Overground]
        `-- Spawn feasibility -> occupancy -> exact patrol brain
```

The registry contains 16 features; World Settings and the three compound cards
are UI groupings, not additional generation passes. Torches are generated once
and transferred into runtime objects, not distributed a second time.

| Feature | Prerequisites / work classification | Bottleneck and current treatment |
| --- | --- | --- |
| Ground | Immediate, per attempt | Public grids retained; scratch smoothing buffers now reused |
| Overground Walls | Ground; immediate | Nine-neighbor allocation/iteration removed from inner count loop |
| Underground Caves | Ground; immediate | Cooperative smoothing swaps two buffers; Med remains six iterations |
| Water | Cave region; immediate | Existing bounded frontier retained; map/sort conversions still pending measurement |
| Walkability | Water topology; immediate | Cooperative flood fill uses one integer queue and visited buffer per traversal |
| Player Position | Final connected region; immediate | Existing center/tie order retained; no independent expensive search found |
| Heart | Start / static reservations; immediate | Batch-scoped candidate reuse; zero count does no candidate or RNG work |
| Chest | Same plus radius 50; immediate | Candidate iteration bounded to the radius square before exact distance filtering |
| Trap | Current object reservations; immediate | Shares candidate batch without sharing/shuffling its source list |
| Torch | Wall adjacency / spacing; immediate, before paired stairs | Fixed zero-count bug; no candidate collection at count zero |
| Fireplace | Underground and current barriers/reservations; immediate | Generic selector improvements; no long-lived terrain cache across mutations |
| Stairs | Both realms and torch occupancy; dependency-bound | Torch membership indexed once instead of repeated array searches |
| Doors | Terrain runs / reservations; immediate | Horizontal/vertical runs collected once per generation call; ordering retained |
| Homes | Walkable footprint / approach / key / reservations; immediate | Region-sized occupancy prefix sums; radius-six key fields/scans; only selected footprints materialized |
| Enemy Spawners | Static placement / normal and development bonus rules; immediate | Shared bounded-distance helper benefits navigation; no change to bonus policy |
| NPC Spawners | Static placement, nearby start route, birth feasibility; immediate | Direct candidate loops; start field bounded to 50; feasibility fields bounded to 20 |
| NPC exact route | Occupancy/birth inputs; deferred after presentation | Occupancy and tick registration are immediate; two presentation opportunities precede bounded resumable A* slices. First due action is retained without a catch-up burst. Terrain/restart invalidation coverage remains incomplete. |

Additional work: building rendering now uses a cell index and cached inside/outside
state; crossing a doorway invalidates the affected footprint. Closed mapview stays
on demand. Minimap evaluates reuse before composition; minimap/mapview partial
composition visits only dirty source cells. Secondary-realm terrain cannot be
deferred because paired stairs depend on it. Fog/discovery metrics, enemy
navigation warmup, lighting influence and overlay costs remain to be measured
before further deferral or narrower invalidation is accepted.

Overlapping active changes were inspected: buildings, NPC patrols, rendered-item
registry, high-traffic boundaries, lockups and performance monitoring. Their
unrelated unfinished tasks remain untouched. Existing NPC runtime behavior is
20-tick actions; older NPC proposal wording is not a reason to change cadence.

## Measurements so far

Environment: Windows x64, Chrome 153.0.0.0, 32 reported logical processors,
viewport 2024 x 982, DPR 1.125; Node 26.7.0, npm 11.19.0, Vite 8.3.0.
No CPU throttle or synthetic viewport was applied.

The following are **single-sample browser fixture phase durations in ms**, not
game-view refresh or complete startup acceptance. `optimization-water`, fixed
eight torches, four stairs, eight generic objects (two chests), development home
and door chance 0.5. Both realms generated. After values are from the latest
placement pass; they are not median/p95 estimates. Browser JIT/GC vary.

| Phase | Low before / after | Med before / after | High before / after |
| --- | ---: | ---: | ---: |
| Both-realm terrain | 84.9 / 53.5 | 247.5 / 109.8 | 634.5 / 476.0 |
| Homes | 2114.9 / 85.1 | 12725.3 / 169.2 | 204765.3 / 1220.6 |
| Overground Chest | 13.9 / 7.3 | 16.9 / 1.9 | 54.8 / 2.2 |
| Underground Chest | 4.9 / 1.6 | 8.6 / 1.6 | 40.3 / 1.6 |
| Doors | 9.5 / 3.9 | 37.2 / 9.7 | 354.8 / 23.3 |
| Overground spawner selection | 38.2 / 14.8 | 50.4 / 22.4 | 241.8 / 140.6 |
| One exact patrol | 12.3 / 7.6 | 20.0 / 15.5 | 70.5 / 83.3 |

Patrol time has not been optimized; High illustrates remaining cost/variance.
The full original Node suite took about 38.7 s, including building tests at 23.3 s
and 11.9 s. The expanded suite now takes about 3 s on this machine. Browser phase
evidence, not test-runner speed, is the relevant user-facing performance measure.

Medium settings-preview bridge check (all-enabled Med densities, diagnostic
`settings-map-view:0` seed, 600 x 300 CSS canvas): cold 666.8 ms, identical warm
0.5 ms and 0.4 ms, with identical PNG data across those draws. A Heart-only High
change took 592.2 ms with terrain reuse but marker recomputation/full repaint.
This is one cold and two warm samples; it does not prove the requested full
configuration matrix or production game-view latency. Preview cache keys are
internal only; no seed/storage values were added to monitoring exports.

## Verification and outstanding work

- Three positive-count reference fixtures remain exact in both realms.
- Zero-count/all-off, bounded distances, building/index behavior, fog/source
  culling, partial draw equivalence, cache release and production defaults have
  focused Node coverage.
- Production browser: fresh all-Med/all-enabled preferences persisted; no layer
  checkboxes; raw disable-layer URL ignored. Preview rendered successfully.
- Identical previews skip generation, composition, backing reset and drawing.
  Heart/Chest/Trap/Fireplace requests reuse preview-owned generation; close/dispose
  release it. Torch/Stairs still invalidate the combined generation stage, so
  finer terrain-versus-placement cache separation remains unfinished.
- Initial terrain submission is no longer reported as complete-world readiness;
  input/reveal wait for initial objects, actors, fog and lighting.
- Full tests/build and strict OpenSpec validation are recorded with the task
  handoff. Build retains the existing large-chunk advisory.

Still required: exclusive per-layer/attempt/yield telemetry; High isolated and
cumulative diagnostics; deferred NPC scheduler with internally bounded searches,
spawn-time navigation consistency and lifecycle tests; fast-input/combat/stair
event-order regression tests; production startup/warm-refresh matrix (three
fixtures, five cold/five warm samples), stress densities and Aspect modes; full
lighting/overlay invalidation proof. No target-compliance claim is made yet.

The deferral integration boundary is significant: player movement, combat and
stair travel mutate state before synchronous `timeSystem.advance`, which dispatches
every actor in registration order. Deferring an NPC callback alone would reorder
simulation. The next implementation must hold the whole dependent action before
its side effects, not skip ticks, reset birth time or run synchronous catch-up.
The installed pathfinding package provides incremental A*, but grid construction
and birth-time terrain/static-obstacle consistency must also be bounded/retained.
