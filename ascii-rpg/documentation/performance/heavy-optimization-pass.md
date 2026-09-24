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
| Water | Cave region; immediate | Typed occupancy/distance/queue buffers now avoid per-lake map/set traversal allocations; bounded frontier and depth bands retained |
| Walkability | Water topology; immediate | Cooperative flood fill uses one integer queue and visited buffer per traversal |
| Player Position | Final connected region; immediate | Existing center/tie order retained; no independent expensive search found |
| Heart | Start / static reservations; immediate | Batch-scoped candidate reuse; zero count does no candidate or RNG work |
| Chest | Same plus radius 50; immediate | Candidate iteration bounded to the radius square before exact distance filtering |
| Trap | Current object reservations; immediate | Shares candidate batch without sharing/shuffling its source list |
| Torch | Wall adjacency / spacing; immediate, before paired stairs | Fixed zero-count bug; no candidate collection at count zero |
| Fireplace | Underground and current barriers/reservations; immediate | Recomputed after civilization barriers so reservations/walkability stay current; generic selector remains bounded |
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

### Nonvisual-work audit

| Operation | Classification | Readiness decision and evidence |
| --- | --- | --- |
| Secondary-realm fog map creation | Deferred after the first active-realm frame | Only the active realm fog is created before the initial render; missing realm fog maps are created after an animation-frame opportunity. Paired stairs and terrain remain immediate prerequisites. |
| NPC exact patrol destination/route | Deferred, bounded, revision-owned | Occupancy, glyph, birth time, and tick registration are immediate; exact route work is scheduled after presentation and covered by scheduler, route parity, cancellation, and due-action tests. |
| Enemy preparation | Immediate static placement | Enemy spawner selection is bounded indexed placement and contributes static Underground occupancy; no separate full-map navigation warmup runs before input-ready. Movement fields are created on demand. |
| Navigation warmup | On demand | No independent full-map warmup consumer exists. NPC feasibility checks remain placement-bound; exact patrol search is deferred and resumable. |
| Hidden mapview/glyph work | On demand/partial | Mapview remains closed until requested. Game, minimap, and mapview glyph preparation is limited to visible or dirty cells, with full-refresh fallbacks. |
| Fog metrics and lighting | Immediate for active view; secondary metrics deferred | Active fog, initial reveal, lighting, collision, and visible placement complete before input unlock. Secondary fog creation occurs after presentation; lighting remains immediate wherever it affects visible cells. |

This audit retains only work needed for visible placement, collision, initial
fog/lighting, paired stairs, or spawn eligibility on the critical path. The
fixed-seed fixture sweep supplies measured placement costs; no terrain-only or
layer-disabled result is substituted for production readiness.

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

### 2026-09-24 — Fixed-seed generation harness sweep

The existing Node harness was rerun for `optimization-open`, `optimization-water`,
and `optimization-obstructed` at Low (128), Med (256), and High (512) dimensions.
Each run generated both realms and emitted deterministic output hashes; these are
development fixture timings, not browser startup or complete-view measurements.
Representative ranges across the three fixtures were:

| Size | Both-realm terrain | Homes | Overground spawners | Patrol |
| --- | ---: | ---: | ---: | ---: |
| Low 128 | 18.0–83.2 ms | 53.9–126.1 ms | 4.5–12.1 ms | 3.2–8.3 ms |
| Med 256 | 82.5–204.5 ms | 401.0–417.9 ms | 13.1–21.8 ms | 9.9–13.8 ms |
| High 512 | 313.2–381.7 ms | 1,388.9–2,110.7 ms | 61.6–81.2 ms | 43.1–49.3 ms |

The sweep ranks Homes as the dominant remaining measured layer at Med and High,
with terrain generation second. The sweep alone is not the required isolated
High matrix or the five-cold/five-warm browser sample requirement; those claims
are kept separate below, so no production target-compliance claim is made.

### 2026-09-24 — Isolated generator matrix

The fixed-seed development generator was also run for both realms together at
Med (256) and High (512) using the three reference fixtures. Each row is one
complete two-realm attempt with the named cumulative option set; `required-only`
retains the ground/region/walkability prerequisites while disabling cave fill,
water, and torches. `ground-cave` adds cave construction and region filtering,
`water` adds water/depth work, and `torch` adds torch candidate/distribution work.
All nine cases completed successfully in the isolated session.

| Size | Required-only | Ground+cave | +Water | +Torches |
| --- | ---: | ---: | ---: | ---: |
| Med 256 (`open` / `water` / `obstructed`) | 92.0 / 49.5 / 34.7 | 68.2 / 66.7 / 59.7 | 80.2 / 60.7 / 53.0 | 67.2 / 73.4 / 53.9 |
| High 512 (`open` / `water` / `obstructed`) | 216.3 / 221.5 / 218.2 | 268.6 / 273.0 / 261.4 | 278.8 / 286.8 / 273.6 | 327.6 / 320.9 / 295.3 |

These are generator timings, not browser readiness timings. They establish the
required-only and cumulative child matrix at the generator boundary; Homes,
civilization, spawners, patrol preparation, and rendering remain separate
downstream measurements in the fixture sweep and are not silently folded into
this table.

The corresponding High fixture capture was rerun for all three seeds and both
realms. The complete emitted phase ranges were: terrain 312.6–372.1 ms;
Overground Heart 32.0–51.7 ms, Chest 1.1–3.3 ms, Trap 27.4–41.6 ms, Homes
1,285.0–1,364.5 ms, NPC spawner selection 48.0–79.1 ms, and one exact patrol
42.7–45.7 ms; Underground Heart 26.8–50.1 ms, Chest 1.1–1.4 ms, Trap
26.6–30.2 ms, Fireplace 26.9–29.7 ms, Doors 20.2–32.7 ms, and Enemy spawner
selection 38.3–48.9 ms. Deterministic Overground and Underground output hashes
were emitted for each fixture. Homes is the dominant measured downstream layer;
terrain is the dominant shared prerequisite, followed by NPC/enemy selection
and object placement.

Medium settings-preview bridge check (all-enabled Med densities, diagnostic
`settings-map-view:0` seed, 600 x 300 CSS canvas): cold 666.8 ms, identical warm
0.5 ms and 0.4 ms, with identical PNG data across those draws. A Heart-only High
change took 592.2 ms with terrain reuse but marker recomputation/full repaint.
This is one cold and two warm samples; it does not prove the requested full
configuration matrix or production game-view latency. Preview cache keys are
internal only; no seed/storage values were added to monitoring exports.

The current primary all-enabled Med game-start sample set contains five fixed-seed
cold readiness samples: 631.9, 702.7, 564.7, 589.4, and 554.0 ms. Every sample
met the 1,000 ms readiness target. For this five-sample set the median is 589.4 ms,
the observed maximum is 702.7 ms, and p95 is reported as the maximum because the
sample count is five. These values include the complete readiness path reported by
the running game, not only generation. They are still only the cold-start slice:
the required five warm game-refresh samples, three-fixture matrix, separate
game/minimap/mapview/preview timings, and High stress-density samples remain
uncollected.

The Playwright CLI then collected five warm idle game-session samples on the same
loaded fixed-seed page at 1280 x 720 CSS pixels, DPR 1, zoom 5: each ran for 350 ms
and produced 20 frames, 57.14 average FPS, 16.8 ms p95 frame time, and 16.8 ms
worst frame time. These are warm frame samples, not five additional world-start
samples, so they supplement rather than replace the outstanding warm-refresh
matrix. A fresh headless startup report on that same viewport measured 1,302.9 ms
total readiness and missed the 1,000 ms target; it had 164.1 ms generation,
1,798.4 ms to complete visible placement, 1,878.3 ms to submit the first complete
view, and 2,102.6 ms to drain deferred work in the report's elapsed timeline.
This headless result is retained as a target gap, not discarded or blended into
the earlier headed samples.

## Verification and outstanding work

### 2026-09-24 — Fixed-seed browser smoke evidence

Manual verification used the local Vite URL
`http://127.0.0.1:5173/babylon-lite-ascii-rpg/?skipTutorial=true&randomSeed=heavy-optimization-browser&performance=startup&muteMusic=true&muteSFX=true`.
The initial world rendered with the character panel, quest state, minimap, and
60 FPS visible; the world clock advanced after an ArrowRight input. The Map icon
opened its active state, and the in-game Aspect control switched from Portrait
to Landscape. A second fixed-seed tab restarted at time `00001` with the same
initial character, quest, minimap, and world-status content. The mapview realm
toggle replaced the active map canvas and returned cleanly to the game canvas;
the active gameplay realm transition through paired stairs was not forced by
teleportation. Full background-resume and deferred-first-action evidence is
still outstanding.

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
- Deferred scheduler tests prove priority ordering, two presentation-frame
  gating, hidden-document suspension, cancellation, fairness, and
  `longestSliceMs` accounting. The browser run did not yet capture a production
  queue-drain trace or a representative longest-slice value, so those remain
  evidence gaps rather than inferred zero-cost work.
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
