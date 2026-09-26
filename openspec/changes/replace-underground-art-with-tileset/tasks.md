# Tasks

## 1. Art source and presentation contract

- [x] 1.1 Inspect the supplied `Tiled_files` package, confirm its distribution terms, and record the approved `walls_floor.png` wall and floor frame coordinates; verify the selected frames are 16px-aligned and visually distinct.
- [x] 1.2 Add only the approved runtime terrain-art asset(s) to the application asset tree and implement a bounded atlas/frame source; verify no TMX parser, static-level loader, or runtime dependency is added.
- [x] 1.3 Add focused Node coverage for logical Underground `wall` and `dirt` terrain-art resolution, including unchanged walkability, world coordinates, and fog eligibility.

## 2. Phase 1 - 1-tile Underground terrain skin

- [x] 2.1 Extend world-view presentation so visible Underground logical `wall` and `dirt` cells use their approved fixed terrain-art frames while non-terrain overlays retain their existing glyph presentation; verify focused renderer tests pass.
- [x] 2.2 Preserve game-view, mini-map, and mapview terrain-art parity at their destination scales, fog opacity, lighting order, and overlay order; verify focused world-view and minimap/mapview tests pass.
- [ ] 2.3 Verify the revised phase-one pair with `npm.cmd run build` and a manual fixed-seed browser session in Underground, confirming movement, terrain blocking, fog, stairs, actors, and overlays remain correct. Build and focused tests pass; fresh browser review is pending because in-app navigation was blocked.

## 3. Phase 1 human acceptance gate

- [ ] 3.1 Present the revised phase-one pair (Dungeons and Pixels wall 31 and floor 13) to a human and obtain explicit acceptance; the original pair was approved, but this replacement pair awaits review. Do not begin task group 4 until acceptance is recorded.

## 4. Phase 2 - deterministic wall autotiling

- [ ] 4.1 After gate 3.1, audit exact source frames with seam previews for solid blocks, 2x2 clusters, isolated walls, thin strips, ends, T-junctions, concave corners, diagonal contacts, and borders. Record 47-tile or 16-tile qualification and frame coordinates in this design; if neither qualifies, report missing forms and stop phase two without marking it complete.
- [ ] 4.2 Implement only the qualified tier's pure resolver: all 16 cardinal patterns, or all 47 gated-diagonal blob patterns. Verify pattern coverage, repeatability, border behavior, viewport-independent neighbors, and affected-neighbor refresh after terrain changes; document the 16-tile corner limitation when applicable.
- [ ] 4.3 Integrate autotile frame resolution with bounded visible/dirty-region presentation while retaining atlas reuse and culling; verify focused renderer, world-view, minimap, and mapview checks pass.
- [ ] 4.4 Verify the selected tier with `npm.cmd run build` and a manual fixed-seed browser session containing centers, edges, corners, 2x2 clusters, and isolated walls; confirm gameplay behavior remains unchanged and include the selected tier's limitations in the handoff.

## 5. Phase 2 human acceptance gate

- [ ] 5.1 Present the verified phase-two fixed-seed playable result to a human and obtain explicit acceptance or revision direction; do not mark this change complete until acceptance is recorded.
