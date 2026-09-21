# Tasks

## 1. Establish output-equivalence helpers and focused coverage

- [x] 1.1 Add focused lighting-field comparison coverage that exercises open terrain, blockers, diagonal corners, torch sources, player direct light, hard shadows, and bounded penumbra values; verify the focused lighting tests pass with the existing visual factors.
- [x] 1.2 Add focused GPU light-pass coverage for reusable sample storage, active-slot reconciliation, ambient headroom, fog filtering, and stale-sprite hiding; verify the GPU light-pass tests preserve the current sample values and visibility semantics.
- [x] 1.3 Add focused movement-render scheduling coverage for superseded movement states and final-position presentation; verify no obsolete position can be rendered after a newer movement is pending.

## 2. Optimize visible lighting and GPU presentation

- [x] 2.1 Refactor bounded moving-player lighting work to reuse scratch storage and share equivalent path/falloff traversal between authoritative and GPU-direct fields without changing shadow-aware, direct, or penumbra outputs; verify lighting output-equivalence tests pass.
- [x] 2.2 Replace per-render GPU light sample and active-slot allocations with reusable arrays/markers while preserving the existing cell-bounded sprite positions, colors, alpha, falloff, ambient headroom, and stale-slot hiding; verify GPU light-pass tests pass.
- [x] 2.3 Keep visible-region rendering limited to the current region and avoid redundant glyph, color, fog, and sprite submissions when their inputs are unchanged; verify rendering and world-view tests pass and the runtime reports no stale visible slots.

## 3. Optimize fog and minimap refresh scheduling

- [x] 3.1 Coalesce movement-driven world and minimap presentation work to the newest player state while keeping discovery state updates synchronous; verify fog tests preserve visibility bands, clear-path blocking, persistence, and starting footprints.
- [x] 3.2 Reuse stable minimap rasters and invalidate only changed fog/content/marker inputs while retaining immediate player and navigation marker correctness; verify minimap renderer and world-view tests pass.
- [x] 3.3 Verify rapid movement never leaves a player-light or minimap marker trail at a superseded cell; use the existing browser surface and inspect the rendered game and minimap after a direction-changing stress run.

## 4. Integrated verification and performance acceptance

- [x] 4.1 Run the complete Node test suite with `npm test` and verify all tests pass without adding or executing Playwright test files.
- [x] 4.2 Run the production build with `npm run build` and verify the configured `/babylon-lite-ascii-rpg/` project path builds successfully.
- [x] 4.3 Run the live browser baseline and stress protocol: record idle FPS, sustain at least ten seconds of rapid Shift movement through changing directions, sample FPS once per second, release movement, and verify every stress sample is at least 55 FPS with recovery to approximately 60 FPS.
- [x] 4.4 Visually compare the optimized live scene with the established result in lit terrain, torch/blocker shadows, player penumbra, fog boundaries, minimap content, and markers; verify no visual regression before marking the change complete.
