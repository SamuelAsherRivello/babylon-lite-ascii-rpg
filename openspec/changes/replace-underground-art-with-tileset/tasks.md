# Tasks

## 1. Art source and presentation contract

- [x] 1.1 Inspect the supplied `Tiled_files` package, confirm its distribution terms, and record the approved `walls_floor.png` wall and floor frame coordinates; verify the selected frames are 16px-aligned and visually distinct.
- [x] 1.2 Add only the approved runtime terrain-art asset(s) to the application asset tree and implement a bounded atlas/frame source; verify no TMX parser, static-level loader, or runtime dependency is added.
- [x] 1.3 Add focused Node coverage for logical Underground `wall` and `dirt` terrain-art resolution, including unchanged walkability, world coordinates, and fog eligibility.

## 2. Phase 1 - 1-tile Underground terrain skin

- [x] 2.1 Extend world-view presentation so visible Underground logical `wall` and `dirt` cells use their approved fixed terrain-art frames while non-terrain overlays retain their existing glyph presentation; verify focused renderer tests pass.
- [x] 2.2 Preserve game-view, mini-map, and mapview terrain-art parity at their destination scales, fog opacity, lighting order, and overlay order; verify focused world-view and minimap/mapview tests pass.
- [ ] 2.3 Verify the revised phase-one pair with build and a manual fixed-seed browser session covering movement, blocking, fog, stairs, actors, and overlays. Build passes and phase-two browser smoke now works; complete stair/overlay regression remains open (see phase-two-verification.md).

## 3. Phase 1 human acceptance gate

- [x] 3.1 Obtain human authorization to continue with the revised phase-one pair. User said to do phase two using the new art, then explicitly authorized composing needed pieces. Floor 13 stays fixed; wall 31 is the composition base.

## 4. Phase 2 - deterministic wall autotiling

- [x] 4.1 Compose the newly authorized 16-pattern family from the new pack; record exact rectangles/order and inspect seam fixtures for solid blocks, 2x2, isolated walls, strips/ends, T-junctions, concave corners, diagonal contacts, and borders. Original unmodified families remain unqualified for 47-tile fidelity.
- [x] 4.2 Implement the pure 16-cardinal resolver; verify coverage, repeatability, borders, viewport-independent neighbors, and neighbor refresh. Document diagonal-corner limits.
- [x] 4.3 Integrate composed rasters with bounded visible/dirty-region rendering and atlas reuse. Combined focused suites: 62 passed.
- [ ] 4.4 Verify the selected tier with `npm.cmd run build` and a manual fixed-seed browser session containing centers, edges, corners, 2x2 clusters, and isolated walls; confirm gameplay behavior remains unchanged and include the selected tier's limitations in the handoff.

## 5. Phase 2 human acceptance gate

- [ ] 5.1 Present the verified phase-two fixed-seed playable result to a human and obtain explicit acceptance or revision direction; do not mark this change complete until acceptance is recorded.

## 6. Phase 3 — planning only

- [x] 6.1 Deliver phase-three-art-plan.md covering all art categories, source preservation, shared art contracts, layer separation, composition/atlas scaling, staged migration, and verification. Do not implement the refactor without further authorization.
