# Tasks

Implementation checkpoint (2026-09-24): see `ascii-rpg/documentation/performance/heavy-optimization-pass.md` for measurements and limitations. Unchecked tasks include partially implemented work; they are not waived. NPC route preparation begins after two presentation opportunities in bounded resumable slices, while placement and tick registration remain immediate; monitor output now records retry, yield, readiness, and deferred completion evidence. Remaining lifecycle, browser, and timing-matrix work is tracked below. Current verification: all 391 Node tests pass, the production build passes with the existing large-chunk advisory, strict validation passes, and `git diff --check` passes apart from normal CRLF notices.

## 1. Baseline and dependency audit

- [x] 1.1 Recheck current code, active overlapping OpenSpec changes, and all 16 registry features; deliver a per-layer inventory of placement dependencies, rendering costs, and immediate/deferred/on-demand work, including NPC eligibility versus exact route planning.
- [x] 1.2 Capture positive-count reference fixtures for terrain/water/connectivity, starts, objects, paired stairs, buildings/keys, civilization, spawners and NPC route outcomes before optimizing; verify each fixture repeats for the same inputs and record baseline revision/environment.
- [x] 1.3 Repair zero-count exits in synchronous/cooperative torch and generic object placement and skip their candidate work; verify Node regressions assert empty results, unchanged reservations, no feature RNG consumption, and no hidden optional content in a diagnostic all-off world.
- [x] 1.4 Add opt-in exclusive phase timings per realm/feature, retries, yield wait, readiness milestones and deferred queue timing to the existing monitor; verify nested phases, repeated attempts, privacy omissions, disabled monitoring, and first-view versus deferred completion with controlled clocks.
- [ ] 1.5 Run the High required-only, individual-child, and cumulative-layer baseline in an isolated fixed-seed development session for both realms; deliver the complete timing matrix and rank measured costs, separating existing shared baseline work from each layer's incremental work.

## 2. Production settings

- [x] 2.1 Resolve production all-enabled/Med defaults independently of development-edited bundled values and preserve valid explicit density/size preferences; verify fresh production, legacy disabled catalogs, invalid values, persistence, and Reset Settings with focused settings tests.
- [x] 2.2 Gate layer-disabling UI/parent controls and URL overrides to development or explicit diagnostics, retain draft Confirm/Cancel behavior, and isolate profiling overrides; verify the actual development and production UI/effective settings agree and no diagnostic run modifies the catalog or user's persisted settings.

## 3. Terrain and placement optimization

- [ ] 3.1 Optimize Ground, Overground Walls, and Underground Caves with reusable buffers and reduced per-cell allocation; verify reference equality for both realms/densities, cooperative cancellation, retry accounting, and measured before/after timings.
- [ ] 3.2 Optimize Walkability region traversal and Player Position using reusable integer traversal data; verify connectivity, minimum area, border/deep-water exclusion, tie-breaking, and reference starts including cases where water disconnects regions.
- [ ] 3.3 Reduce measured Water allocation/conversion costs and bound expensive lake/depth work without changing selection or bands; verify seeded shape/depth equality, lake-failure termination, cancellation, and measured timings for sparse and nine-lake cases.
- [ ] 3.4 Reuse valid candidate data across Heart, Chest, Trap, Torch and Fireplace placement with current reservations and bounded-distance filters; verify each child against reference output, realm limits, positive/zero counts, spacing, and before/after timings.
- [ ] 3.5 Index paired-Stairs candidate eligibility and torch occupancy while preserving both-realm dependencies; verify reference coordinates, disabled stairs, blocked candidates, and independent density/count behavior with measured timings.
- [ ] 3.6 Replace repeated full-map Doors run searches with revision-scoped run collection and region grouping; verify horizontal/vertical ordering, cross-region extents, fences/doors/keys, reservation rules, seeded output and before/after timings.
- [x] 3.7 Bound Homes key reachability searches and avoid constructing full footprints for rejected/unselected origins; verify footprint/approach/key validity, RNG order, exact reference buildings, no-candidate cases and before/after timings at Med and High.
- [ ] 3.8 Reuse static indexes and bounded distance work for Enemy and NPC spawner placement; verify exact selected cells, development bonus separation, nearby-NPC constraint, initial spawn feasibility and measured per-layer improvements.

## 4. Deferred nonvisual preparation

- [x] 4.1 Add a game-owned injectable deferred scheduler with a presentation boundary, bounded resumable work, priority and completion states; verify ordering, cancellation, fairness, longest-slice accounting and hidden-document suspension with a controlled scheduler.
- [x] 4.2 Split NPC occupancy/tick registration from exact patrol choice, capture stable birth-time/random inputs, and schedule route preparation after initial presentation; verify NPCs render at final initial cells before routes are ready with no duplicated actors or subscriptions.
- [x] 4.3 Bound patrol route work internally and reuse compatible navigation data while preserving search results; verify obstacle-heavy routes, exhausted candidates, revision changes, reference tie behavior and that no single deferred job rebuilds/searches an unbounded map without yielding.
- [x] 4.4 Preserve logical event order when a first eligible NPC action arrives before preparation finishes; verify fast-input and slow-scheduler fixtures produce the same routes/actions as ready-before-action fixtures, without dropped ticks, birth-time resets or catch-up bursts.
- [x] 4.5 Connect deferred cancellation/reprioritization to restart, disposal, entity removal, terrain changes, realm switches and failures; verify obsolete results cannot mutate the current world and every job settles or remains validly suspended.
- [ ] 4.6 Complete the nonvisual-work audit for secondary-realm fog metrics, navigation warmup, enemy preparation and hidden-view/glyph work; defer or make on-demand each proven independent expensive operation, and deliver measured justification for each retained prerequisite. Verify all visible placement, collision, initial fog/lighting and paired-stair invariants before declaring complete-view readiness.

## 5. Generation and rendering caches

- [ ] 5.1 Separate preview request cancellation identity from semantic generation identity and retain bounded immutable stage results; verify identical previews perform zero regeneration, object-only changes reuse terrain, upstream changes invalidate dependents, and cancellation/close/restart releases obsolete resources.
- [ ] 5.2 Evaluate compatible minimap/preview reuse before composition or canvas reset and restrict mapview partial composition to affected regions; verify reuse/partial/full work counts and equivalent final pixels or draw commands, including cancelled preview publication.
- [x] 5.3 Add world-cell building presentation indexes and cache player-inside state per building; verify walls/doors/roof/interior/key precedence, player entry/exit invalidation, and full/partial rendering equivalence at both view scales.
- [ ] 5.4 Bound game/minimap/mapview refresh work by fog, lighting, GPU-light and overlay influence, retaining full-refresh fallbacks and shared glyph semantics; verify local moves, collection, door changes, mountains, realm/zoom/font/palette changes, health bars and floating text against full redraws.

## 6. Integrated verification and evidence

- [x] 6.1 Run focused affected Node tests, `npm.cmd test`, `npm.cmd run build`, `git diff --check`, and strict change validation; report actual results and distinguish unrelated existing failures from this change's regressions.
- [ ] 6.2 Manually verify complete initial content followed by deferred route preparation, first NPC action, movement/sprint, rapid preview replacement, restart, realm changes and background/resume in the actual browser using fixed seeds and the in-game Aspect modes; record working URLs and visible evidence without Playwright test files.
- [ ] 6.3 Repeat all layer diagnostics and the all-enabled Low/Med/High with Med densities plus separate High-density stress checks; use at least three representative fixtures and five cold/five warm samples per primary configuration, report median/p95/max/sample counts and environment, and compare game/minimap/mapview/preview independently.
- [ ] 6.4 Deliver `ascii-rpg/documentation/performance/heavy-optimization-pass.md` with the final layer inventory, before/after timings, cold versus cached results, longest deferred slices/queue drain, parity checks, target gaps and remaining measured bottlenecks; verify no result substitutes a terrain-only or layer-disabled run for production readiness and no exported monitoring data includes seeds or storage contents.
