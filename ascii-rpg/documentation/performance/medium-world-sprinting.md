# Medium-world sprint performance investigation

Date: 2026-09-24. OpenSpec change: `optimize-medium-world-sprinting`.

## Status

Optimization is implemented, but the strict **every one-second sample >=50 FPS in both realms** acceptance criterion is not yet verified. Do not interpret an average above 50 as a pass. Existing gameplay rules, enemy density, lighting and player-driven ticks are retained.

## Layer isolation

Each of the original thirteen optional procedural layers was disabled independently with `generationOverrides=disable:<id>`, an explicit fixed seed and `generationDensity=Med`. Required ground, walkability and player layers remained enabled. Runs measured eight seconds per realm. URL overrides were confined to the agent's verification window.

| Disabled layer | Overground average FPS | Underground average FPS | Underground pending callbacks |
|---|---:|---:|---:|
| None | 55.88 | 57.38 | 10,535 |
| 2 Walls | 59.60 | 59.20 | 10,728 |
| 3 Caves | 59.75 | 59.75 | 10,181 |
| 4 Water | 59.63 | 53.81 | 9,383 |
| 7 Hearts | 59.87 | 59.13 | 9,857 |
| 8 Chests | 59.62 | 56.25 | 10,351 |
| 9 Traps | 59.75 | 59.09 | 8,894 |
| 10 Torches | 18.13 | 44.13 | 8,571 |
| 11 NPCs | 54.75 | 56.50 | 8,461 |
| 12 Fireplaces | 59.50 | 59.25 | 10,885 |
| 13 Stairs | 59.75 | 59.37 | 8,931 |
| 14 Doors | 59.75 | 59.50 | 7,612 |
| 15 Homes | 59.87 | 59.75 | 10,303 |
| 16 Enemy spawners | 54.37 | 58.30 | 48 |

The FPS deltas are exploratory, not a controlled ranking: host load, browser panel size and concurrent checkout edits varied. In particular, the torch-disabled outlier is not evidence that removing torches makes rendering intrinsically slower. The enemy-disabled callback count is the strongest attribution signal: almost all backlog disappears only when that layer is removed. No layer is disabled in final all-enabled verification.

Concurrent work subsequently introduced a welcome-sign layer 17. That new feature was not part of the original layer-ablation matrix.

## Bottlenecks and changes

1. **Enemy navigation and queue starvation.** Continuous input restarted the scheduler's two-frame presentation delay. Each far enemy repeatedly rebuilt sector reachability and searched many exits. Delay now starts only for a previously empty queue; sector reverse reachability is reused; one bounded field ranks exits before a single path refinement. A local open-world probe reduced warm hierarchical queries from about 4.305 ms to 0.264 ms (microbenchmark, not end-to-end FPS).
2. **Repeated enemy routes and allocations.** Typed-array BFS avoids per-neighbor object/freeze allocations. Revision-aware route caching validates world, target sector, position and the next step, invalidates changed terrain/objects, and requests a fresh segment when a traversable segment ends. Unchanged no-step results are reused. Near-enemy fields can share identical target/revision state across deferred ticks.
3. **Lighting/minimap cache churn.** Stable per-realm torch snapshots avoid invalidating unchanged lighting fields. Terrain and door changes explicitly invalidate light caches. Identical final minimap tints reuse the same raster, without quantizing or weakening lighting. The minimap remains a larger measured presentation cost than the main view.
4. **Trustworthy diagnostics.** An explicit opt-in driver uses normal Shift/direction handlers and their repeat loop. It does not teleport during movement, remove enemies, grant health, or generate its own logical ticks. It checks legal camera movement, reports actual cell changes and complete roughly-one-second frame samples, and rejects death/stalls as sustained-movement evidence. Queue age tracks all callbacks, not just the first one.

## Stable production-preview measurements

Build `index-PcigLGL8.js`, Windows Chromium 153, natural Codex browser viewport 464x589 CSS pixels, DPR 2.5, Zoom 5, Camera Center, Aspect Landscape. Both worlds were 256x256 (Med), all enabled layers at Med density. Thirty seconds per realm, after transition/warmup. No test/build commands ran during these measurements.

| Run / realm | Average FPS | Minimum one-second FPS | Moves / unique cells | p95 / worst frame ms | End pending / oldest age ms | Sustained movement |
|---|---:|---:|---:|---:|---:|---|
| A Overground | 58.17 | 50.00 | 710 / 710 | 16.9 / 50.2 | 147 / 41.3 | Yes |
| A Underground | 53.67 | 32.65 | 466 / 458 | 33.3 / 166.5 | 0 / 0 | No: obstructed final seconds |
| B Overground | 59.87 | 59.00 | 700 / 687 | 16.8 / 33.3 | 0 / 0 | Yes |
| B Underground | 56.40 | 46.00 | 555 / 543 | 16.9 / 150.1 | 197 / 48.3 | Yes |

In B Underground, average main-world presentation was 0.42 ms and minimap 3.20 ms; the longest scheduler slice was 4.9 ms. Sampled queue age peaked at 124.3 ms and repeatedly returned to zero. This is substantially below the original multi-second backlog, but it is not a strict 50-FPS pass.

Phase arrays retain at most 12,000 samples, so high-volume deferred phase summaries cover only their retained portion; per-second queue samples and final diagnostics are needed to judge the entire run. Earlier development-server measurements are not final acceptance evidence: live edits repeatedly caused hot reload, and the natural browser viewport changed. An earlier incomplete fix also accumulated 16,564 underground callbacks and the player died; that run was rejected.

### Latest integrated-build repeat (failed)

After near-field reuse and further concurrent gameplay changes, build `index-C5DzEayr.js` was tested with run B at the same reported viewport/DPR. Both realms completed thirty seconds with movement in every sample, but performance was worse:

| Realm | Average / minimum FPS | Moves / unique cells | p95 / worst frame ms | End pending / oldest age ms |
|---|---:|---:|---:|---:|
| Overground | 55.93 / 42.57 | 582 / 543 | 33.1 / 100.2 | 0 / 0 |
| Underground | 31.10 / 18.10 | 481 / 475 | 66.6 / 166.7 | 1,841 / 413.8 |

Average minimap presentation increased to 8.40 ms Overground and 5.53 ms Underground; main-world averages were 0.97 and 0.67 ms. The Underground scheduler's longest slice reached 10.5 ms. These results remain failures. They cannot establish whether host load, concurrent gameplay changes or the optimization caused the regression; a stable-checkout comparison and further minimap/long-frame profiling are required. Do not substitute the earlier better averages for this latest evidence.

### Containerized Chrome comparison (rejected)

On 2026-09-26, the current integrated build was run in Chrome 143.0.7499.169 inside a Selenium Docker container with its natural 937x895 CSS-pixel viewport and DPR 1. The container has no hardware WebGPU device, so Chrome was started with SwiftShader and `--enable-unsafe-webgpu`. The Overground run for `codex-sprint-layers` completed with sustained movement but did not meet acceptance: 24.93 average FPS, 14.29 minimum one-second FPS, 510 moves / 508 unique cells, 66.7 ms p95 and 83.4 ms worst frame, and 294 pending callbacks with 86.5 ms oldest age at completion. The WebGPU device was then lost during the realm transition, preventing Underground from starting. This is rejected evidence: it is a software-rendered Linux container rather than the documented desktop benchmark and does not provide both realms or the second seed.

### Windows desktop run: `mui5gv24-frlo26` (rejected)

Chrome 154 on Windows, natural 1647x743 CSS-pixel viewport, DPR 1.167, Zoom 8, completed both 256x256 Med worlds with all layers enabled. Overground passed the strict sampling criterion: 59.90 average FPS, 59.01 minimum one-second FPS, 670 moves / 663 unique cells, 16.9 ms p95 and 33.3 ms worst frame, with no pending callbacks at completion. Underground maintained 58.07 average FPS and a 53.99 minimum one-second FPS, but its final four complete one-second samples recorded zero moves. It therefore reported `sustainedMovement: false` and is rejected under the movement-validity requirement. Underground recorded 494 moves / 488 unique cells before the stall, a 16.8 ms p95 and 116.6 ms worst frame, and no pending callbacks at completion. Repeat the desktop diagnostic with uninterrupted movement, then run a second fixed seed.

## Reproduction

From the repository root, run `npm.cmd run build`, then `npm.cmd run preview -- --host 127.0.0.1 --port 4178 --strictPort`. Use the normal browser viewport, Camera Center and Zoom 5. Diagnostic settings are session-isolated and do not change saved procedural defaults.

- Run A: `http://127.0.0.1:4178/babylon-lite-ascii-rpg/?randomSeed=codex-sprint-layers&skipTutorial=true&generationDiagnostics=true&generationDensity=Med&performanceSprint=true&performanceDurationMs=30000`
- Run B: replace `randomSeed` with `codex-sprint-repeat`.
- Ordinary manual play: remove `performanceSprint` and `performanceDurationMs`, then hold Shift plus a movement direction. Keep all layers enabled.

Read console messages prefixed `ASCII RPG sprint diagnostic`. Check `sustainedMovement`, `minimumFps`, all samples and pending-work age, not only `averageFps`. Diagnostic exports omit seeds and browser storage; the explicit synthetic reproduction seed belongs only to these test instructions.

## Verification and remaining work

- Focused scheduler, pathfinding, lighting/source identity, route caching and diagnostic tests pass.
- Production build passes (existing >500 kB bundle warning).
- Strict validation of this OpenSpec change passes.
- Latest full-suite run: **457/457 passed** under Node 24 on 2026-09-26. The production build and strict OpenSpec validation also pass.
- Remaining acceptance: run stable, uninterrupted all-layer medium-world sprinting on the documented desktop benchmark in both realms for two fixed seeds; all complete one-second samples must reach 50 FPS. The `mui5gv24-frlo26` desktop run meets the FPS threshold but is rejected because Underground stalls during its final four samples. Keep task 2.2 open until valid evidence exists.
