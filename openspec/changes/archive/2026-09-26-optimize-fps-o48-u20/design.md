## Context

Layer ablation identified the enemy layer as the dominant source of deferred simulation backlog. Continuous enqueue reset the scheduler's presentation delay, while hierarchical navigation repeatedly rebuilt sector reachability and searched every exit. Lighting source identity also invalidated otherwise reusable fields. Average FPS alone concealed stalled movement and thousands of pending callbacks.

## Goals / Non-Goals

Goals: sustain 48 sampled FPS in Overground and 20 sampled FPS in Underground
during real medium-world sprinting; keep all layers and Med densities; prevent
accumulating tick lag; provide reproducible evidence.

Non-goals: changing movement cadence, weakening enemies, reducing density, adding autonomous ticks, replacing the renderer, new dependencies, deployment, or unrelated cleanup.

## Decisions

- Start the scheduler presentation delay only when an empty queue receives work, so continuous input cannot starve old jobs.
- Build sector reverse connectivity once, bound target reachability caching, rank exits with one typed-array distance field, and refine only the winning exit with the established pathfinder.
- Reuse far-enemy paths only while world, navigation revision, target sector, expected position, and next-cell validity agree. Invalidate on relevant terrain/object mutations; keep legacy behavior for callers without revision support.
- Reuse a near-enemy distance field across logical ticks only when world, target cell and explicit static-navigation revision remain identical; retain only one field state. Cache unchanged no-step routes, but rebuild completed multi-cell route segments.
- Cache torch source snapshots by realm and invalidate on torch changes. Explicitly invalidate lighting fields when terrain/doors change. Reuse minimap rasters only when their final tint is unchanged.
- Measure actual keyboard-path movement in bounded opt-in runs; report per-second samples and reject death/stalls rather than accepting average FPS alone.

## Risks / Trade-offs

- Stale navigation or lighting caches could change behavior: mitigate with explicit revision/invalidation and focused regression tests.
- Deferred callbacks may exceed a frame budget: measure pending count and age rather than hiding lag behind smooth rendering.
- Host/browser load and viewport changes make ablation FPS deltas noisy: use work counts for attribution and repeat final all-enabled runs at a documented natural viewport.
- Live gameplay can kill or obstruct the benchmark player: retain those rules and report invalid runs honestly.

## Verification

Node regression tests for scheduling, pathfinding, lighting identity/invalidation and route reuse; full repository tests and production build; all optional layer ablations; thirty-second all-enabled runs in both realms with two explicit seeds. Record environment, per-second FPS, movement, frame times and queue diagnostics. No Playwright test files.
