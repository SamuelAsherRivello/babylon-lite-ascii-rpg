# Design

## Context

See proposal.md for motivation and performance goals. Current code was inspected on main; timings have not yet been collected. React owns settings; the bridge requests previews/restarts; Babylon Lite owns world state, placement, navigation, and rendering. Keep these boundaries and existing public helper contracts.

The earlier exploration ranking was provisional. In particular, Med cave smoothing is six iterations; High world size with Med density still uses six, not seven. Water fill percentage is a lake occurrence chance, not percent map coverage. Transferring generated torches into runtime objects is not a second torch placement pass. Stairs are one civilization feature, not two independent layers.

Verified hotspots and proposed treatment (N = cells per realm):

| Feature / stage | Current code evidence | Planned treatment |
| --- | --- | --- |
| Ground | `world-system.js:createWorldCooperative` creates multiple full grids per attempt | Reuse numeric scratch buffers and materialize public terrain records once; retain abort checks |
| Overground Walls / Underground Caves | Full grid rebuilt per smoothing iteration, followed by flood fill; generation may retry | Double-buffer smoothing; integer queues/visited maps; keep rule, neighbor order, seed draws, connectivity and retry behavior |
| Water | `selectLakeCells` already uses typed scratch/frontier sampling; `assignWaterDepths` uses maps, sorting and string keys | Measure existing optimized growth before changing it; reduce conversions/allocations with identical depth bands and tie order; yield inside costly work |
| Walkability | Second region traversal and mask reconstruction after water | Reuse buffers; reuse connected-region results only when unchanged topology proves validity |
| Player Position | Linear center-most selection from final walkable region | Reuse region indexes; preserve tie-breaking and final terrain validation |
| Heart / Chest / Trap | `selectObjectCells` collects and shuffles the whole candidate list independently per type | Reuse base candidates and current occupancy with identical filtering/shuffle order; use bounded chest-distance filtering; do not change reservations |
| Torch | Candidates collected and shuffled even at count zero; zero never satisfies the post-insertion equality break | Fix zero-count exit in sync/cooperative paths before diagnostic profiling; avoid hidden generation when disabled; retain positive-count output |
| Fireplace | Another candidate scan after civilization placement | Reuse base terrain candidates but refresh effective occupancy after barriers; retain Underground scope |
| Stairs | `addPairedStairs` intersects both realm grids and checks torch arrays per cell | Use indexed occupancy and shared walkability; retain paired coordinates and independent count; both realm terrain results remain prerequisites |
| Doors / fences / keys | `collectRuns` scans the entire world twice for each selected screen region, filtering to that region afterwards | Collect runs once per terrain revision and bucket by door region; preserve order, barrier extents crossing region boundaries, key rules and reservations |
| Homes / roof / walls / interior / door / key | `findHomeCandidates` creates frozen 200-cell footprints at every origin; every valid origin calls `findExteriorKey`, allocating an N-sized distance field and scanning N cells despite distance limit 6 | Check rectangular feasibility before object creation; bounded distance/key search within reachable radius, stable candidate order/RNG; instantiate selected homes; retain all random draws needed for equivalent choices |
| Enemy Spawners | Separate static occupancy and candidate scans; development bonus differs from production | Share current indexes; preserve normal and bonus policies; defer only proven nonvisual navigation preparation |
| NPC Spawners / NPCs | `candidates` creates every coordinate with flatMap; unbounded start distance field is only queried through 50; adjacent spawn eligibility computes up to eight distance fields | Direct indexed iteration and bounded distance fields; preserve eligible-cell set/order before random selection; route feasibility remains a placement dependency |
| NPC patrol brain | `addNpc` calls `createPatrol` before claiming occupancy; up to 32 `findPath` calls can each rebuild a full-world pathfinding grid | Claim/register/render first; enqueue actual patrol choice after presentation; reuse revision-safe navigation data, make attempts resumable and bound individual path jobs |
| Building rendering | `getBuildingOverlayGlyph` maps every building for each queried cell; `getBuildingGlyph` scans wall/interior arrays | Cell-to-building index and per-building player-inside state; invalidate affected footprint on door/inside changes |
| Shared world views | Minimap composes before cache evaluation; mapview evaluates earlier but partial mode still composes full source; game scheduler already selects partial/reuse before render | Keep working game cache paths; early minimap reuse; dirty-cell composition/raster lookup and overlay handling only where required |
| Generation preview | Every request regenerates both realms, resets canvas dimensions, uses changing revision in content key, and forces full repaint | Separate cancellation revision from semantic input identity; bounded generated-terrain/placement/presentation cache with stage-specific dependencies |

`selectObjectCells(count=0)` also currently pushes one candidate before its count check. Fix this along with the torch case so an all-optional-off experiment is meaningful. These are targeted empty-layer corrections, not permission to alter positive-count distributions.

## Goals / Non-Goals

Goals: reduce real computation and allocations; make readiness truthful; keep all production features, visual parity, seeded generation, logical tick cadence, and responsive input; make High layer isolation representative and Med/all-enabled/Med-density the primary acceptance case.

Non-goals: broad module extraction from the separate refactor proposal, new renderer or pathfinding dependency, general-purpose worker infrastructure, lower visual quality, fewer production objects, altered procedural algorithms, or reduced animation cadence. Do not create a second cache framework when the existing view cache can be extended.

## Decisions

### 1. Baseline every layer with separate cold and warm measurements

Extend the opt-in monitor with exclusive phase durations by realm/feature, work counts, retries, allocations where practical, yield wait, queue wait, and cache decisions. Do not infer durations by subtracting overwritten phase timestamps shared between realms. Include both full cold generation-to-complete-view and warm state-change-to-present latency. Distinguish CPU submission, browser presentation opportunity, and GPU completion; do not label requestAnimationFrame as measured physical display latency.

Use an isolated development session, explicit fixed randomSeed test fixtures, fixed actual zoom/lighting/fog/font/palette/Aspect, and the verified dimensions Low=128, Med=256, High=512 per realm. No synthetic browser sizing. Record machine/browser/build context and fixture identifiers in a local evidence report; monitoring exports omit seed values, storage and world contents.

Start High with only Ground/Walkability/Player Position, then each optional child with required placement context, then cumulative enabled layers. Capture all 16 features in both applicable realms, plus shared rendering/lighting/fog and deferred work. Include parent-group integration checks. At least three known fixtures (open ground/buildings, caves/water, obstructed NPC route), five cold and five warm runs per primary acceptance configuration; summarize median/p95/max with sample count and limitations. Layer isolation can use fewer repeats initially but repeat any proposed hotspot to establish the improvement. Report production and Vite development separately: home/door chance is 0.1 versus 0.5 before density multipliers, with additional development spawner behavior.

Alternative rejected: declaring a faster terrain-only first frame to meet the complete-view goal, or treating 100-500 ms as a frame-rate throttle. Existing movement responsiveness remains a regression constraint.

### 2. Optimize per-layer work while retaining observable results

Introduce generation-owned numeric indexes/scratch buffers behind existing object-shaped public boundaries. Cache terrain candidates independently of mutable reservations; refresh reservation/occupancy at the consuming pass. For civilization and homes, preserve scan order, tie order, RNG consumption, and region eligibility while removing whole-world repeated searches. For water and connectivity, retain final connected-region validation; a shortcut requires proof of unchanged topology.

Use reference fixtures from the pre-change implementation for positive-count layers and compare terrain, starts, objects, keys, doors, buildings, stairs, spawners, and final patrol outcomes. Disabled/zero-count corrections are explicit exceptions to buggy baseline output. No algorithm rewrite or new sampling distribution is assumed by this plan. Prefer double buffers/indexing and bounded search over random sampling changes that perturb deterministic output.

### 3. Separate placement readiness from nonvisual preparation

Proposed lifecycle:

```text
terrain + paired stairs
    -> static placement + collision/occupancy + visible actors
    -> current fog/lighting + complete visible frame submission
    -> browser presentation opportunity
    -> bounded deferred jobs (starting on the next frame opportunity)
    -> complete simulation readiness
```

NPC `addNpc` claims the selected cell and registers the actor with a pending patrol state. Capture its birth time and dedicated deterministic random source once. Compute the exact destination/route later and publish only to the same live actor/session/terrain revision. Route preparation does not mutate visible cell, glyph, birth time, occupancy, or unrelated random streams. No active AI jobs run in the settings preview, whose markers need placement data only.

Spawn feasibility (`hasPatrolRoute`) currently affects which initial cell is eligible and cannot simply be deferred. Optimize its bounded checks before choosing placement. Exact patrol selection is the initial required deferral. Audit other work in a classification table during apply: immediate (placement/collision/first fog/lighting), deferred (actual route and proven nonvisual metrics/index warmup), on-demand (closed mapview or unused glyph preparation), or dependency-bound (both realm terrain for stairs). Record evidence for each candidate retained on the critical path. Do not defer secondary terrain wholesale because shared stairs need it.

Logical time is movement-driven, with NPC actions every 20 ticks after birth. If a pending NPC reaches its first eligible action before its route is ready, prioritize its preparation and hold the dependent simulation action until the job is ready, preserving event order; do not skip the action, advance birth time, replay a movement burst, or force a large synchronous fallback. Input/overall simulation readiness is separately reported if this dependency temporarily waits. Empty-route results settle once as stationary under existing behavior, without endless retries. Tests use different scheduler speeds with the same logical inputs and expect equivalent outcomes.

### 4. Give deferred jobs a real presentation boundary and bounded lifecycle

Use an injectable game-owned scheduler with session/realm/entity identifiers, terrain revisions, cancellation, and small time/work budgets. A requestAnimationFrame callback runs before paint: schedule the queue behind the submitted frame's presentation opportunity (for example, two staged frame callbacks), and verify the ordering in a real browser. Start work after that opportunity; do not promise that physical pixels were displayed. Hidden documents may suspend jobs; resume only current work when visible.

Bound jobs internally as well as between jobs. Deferring one monolithic full-world path search still stalls the next frame. Share a revision-safe navigation grid or bounded/resumable search, preserve route tie semantics, and checkpoint between attempts and within any remaining long phase. Prioritize active-realm actors with imminent actions. Cancellation on restart, preview replacement, disposal, entity removal, or incompatible terrain change discards results and resources. Realm changes pause/reprioritize inactive work or cancel it safely; valid preparation can resume without duplicated actors/ticks. Async failures reach a settled diagnostic state and never leave an undrainable queue or unhandled rejection.

Alternative rejected: a timeout around unchanged expensive startup code, or await of an already-resolved promise, because neither guarantees an opportunity to present or a bounded subsequent task.

### 5. Cache by dependencies before expensive preparation

Preserve `world-view-cache` evaluation/commit semantics and bounded resource ownership. Introduce stable world-generation semantic keys from dimensions, seed identity (internal only), applicable enabled flags/densities, catalog/profile version, and realm dependencies. Keep request revision solely for cancellation. Terrain-changing inputs invalidate terrain and dependent placement; object-only changes reuse terrain safely but replay dependent placement in order. Cached generated data must not share mutable gameplay, fog, or entity state with previews.

For presentation keys include realm/world revision, crop/geometry/backing size, font/palette/offsets, lighting/GPU-light, fog, markers, and overlays. Do not reset canvas backing dimensions on an otherwise reusable request. Unchanged previews bypass generation and composition; dirty updates resolve only affected cells plus lighting/overlay influence. Invalidations covering broad areas use a full refresh. Coalesce pending updates and commit only the newest completed frame. Index building glyphs by world cell. Include light/shadow/fog costs in measurements and retain cached fields only while their revisions are compatible.

Alternative rejected: per-feature canvases drawn independently, because topmost glyph precedence, roof/interior behavior, lighting, fog, and occupancy require shared composition.

### 6. Production settings and development isolation

Normal production effective enablement is all applicable features true. Absent densities/world size use Med regardless of development-edited bundled JSON. Preserve valid user-selected density/size settings and existing Confirm/Cancel persistence. A disabled value retained from diagnostics cannot silently hide a production layer. Development remains able to isolate children/parents, with the three required baseline passes always enabled. Disable controls are available only in development or an explicit supported diagnostic session; production UI must not suggest a disabled state that is ignored. Existing URL diagnostic layer flags must be gated accordingly. Automated diagnostics must not overwrite the checked-in catalog or user storage.

## Risks / Trade-offs

- Deterministic output changes from ordering/RNG shortcuts -> baseline fixtures and positive-count equivalence checks before accepting each optimization.
- Deferral merely moves a stall -> record longest work slice, queue drain, first-action latency, and post-ready frame pacing as well as first-frame time.
- Bounded navigation chooses a different route -> preserve established search/tie semantics and use a validated fallback when a local bound cannot contain the equivalent route.
- Cached terrain or occupancy becomes stale -> explicit revision keys, immutable cached generation results, and current placement reservations.
- Lighting influence or building interior changes extend beyond a single cell -> invalidate the full affected area and use full-refresh fallback when required.
- Other active changes touch the same modules/specs -> re-read current status/diffs and compatible deltas at apply time; leave their unrelated tasks untouched.
- Machine-dependent goals may be missed -> record measured values and remaining bottlenecks; numerical goals are soft, but correctness, all-enabled content, bounded work and truthful reporting are required.

## Migration Plan

Capture baseline and regression fixtures, repair empty-layer isolation, add phase/queue diagnostics, optimize highest measured loops, introduce deferred patrol initialization, then integrate generation/view cache improvements. Verify each increment in Node and the browser before moving on. Normalize production effective settings without deleting valid density/size selections. Run existing tests and build and publish local before/after evidence. Recovery is an additive corrective change to the affected optimization; no branch creation, history rewrite, or unrelated refactor is part of this plan.

## Open Questions

- Choose scheduler slice budget and dirty/full thresholds from the measured target browser, including coarse-pointer mobile behavior.
- Determine which additional nonvisual preparation is expensive enough to defer after the complete placement snapshot; no such candidate is automatically excluded from the audit.
- Confirm whether the soft latency goals are achievable on the measured hardware after the highest-cost repeated scans are removed.
