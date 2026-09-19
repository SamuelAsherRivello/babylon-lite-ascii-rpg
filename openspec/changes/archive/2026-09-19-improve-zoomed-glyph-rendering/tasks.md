# Tasks

## 1. Establish rendering measurements and cache boundaries

- [x] 1.1 Add focused rendering instrumentation or test seams for visible-cell count, glyph-visual cache hits/misses, redraw/update counts, and cache memory or entry bounds; verify the instrumentation can compare zooms 1, 5, 10, and one diagnostic zoom below 1 without changing the normal user-facing zoom limits.
- [x] 1.2 Define and test the cache key and invalidation behavior for font, glyph identity, zoom level, palette revision/style lookup, and renderer rebuilds; verify palette changes do not create one glyph-shape entry per color/opacity combination and font changes cannot reuse stale font visuals.
- [x] 1.3 Add end-to-end readiness timing for generation start, complete world-data availability, first visible-region render, and total completion; verify the measurement reports the under-1-second target and approximately 0.1-second ideal separately from frame-by-frame responsiveness.
- [x] 1.4 Add separate timing for cold glyph warmup and cached zoom request-to-visible-region submission; verify cached zoom changes are measured against approximately 16.7 milliseconds without including world generation.

## 2. Make world generation cooperative

- [x] 2.1 Refactor world generation into resumable bounded work slices while preserving deterministic seeds, generation-pass ordering, connectivity guarantees, water/torch data, and player placement; verify existing synchronous generation tests still describe the same completed world data.
- [x] 2.2 Integrate staged generation with game-layer startup so the main thread yields between slices and no partially generated world is exposed as playable; verify input/render scheduling remains responsive and the runtime publishes the world only after required data is complete.
- [x] 2.3 Measure full world-data construction separately from first visible-region rendering at the 512x512 production size; verify total readiness targets are reported honestly when the ideal 0.1-second target is missed.
- [x] 2.4 Preserve the completed synchronous world-builder behavior for deterministic tests while exposing a resumable cooperative runtime path; verify seeded completed worlds remain identical to existing expectations.
- [x] 2.5 Handle replacement or cancellation of in-progress generation; verify stale generation results cannot publish after a newer request and incomplete worlds are never exposed as playable.

## 3. Implement zoom-aware glyph visuals

- [x] 3.1 Add a representation-neutral zoom-aware glyph visual resolver with lazy population; verify repeated requests for the same font, glyph, and zoom reuse the same visual data and startup does not prebuild the full palette.
- [x] 3.2 Evaluate per-zoom raster frames against an SDF/mask-style shader path; verify the selected representation produces the clearest consistent result at zooms 1, 5, and 10 without adding a new dependency.
- [x] 3.3 Integrate selected visuals with the existing sprite atlas/layer lifecycle, palette tint/opacity inputs, font switching, and viewport rebuilds; verify obsolete font/atlas resources are replaced safely.
- [x] 3.4 Preserve a static-shape versus dynamic-presentation boundary; verify presentation-time color, opacity, animation, or shader parameters do not require one static cache entry per animation state.

## 4. Reduce redundant visible-cell work

- [x] 4.1 Refactor visible-cell rendering to retain reusable resolved sprite/style data and identify unchanged cells or regions; verify a player movement with a stable viewport does not recreate unchanged visible cell visuals.
- [x] 4.2 Preserve and harden viewport/world-bound culling for normal and diagnostic zooms; verify cells outside the calculated visible region are hidden or omitted and iteration never exceeds world bounds.
- [x] 4.3 Add or preserve a full-refresh path for zoom, resize, font, palette, atlas, and viewport-origin changes; verify no sprite remains positioned or styled for the previous viewport after a required rebuild.
- [x] 4.4 Ensure palette-only updates touch affected visible styles without regenerating static glyph visuals or refreshing off-screen cells; verify unchanged off-screen state is not submitted.
- [x] 4.5 Optimize cached zoom changes to refresh only the current visible region; verify complete world data is not rebuilt and cached rerender timing is reported against approximately 16.7 milliseconds.

## 5. Add focused validation and browser proof

- [x] 5.1 Extend focused Node tests for cooperative generation determinism, replacement/cancellation, zoom-aware viewport behavior, cache reuse/invalidation, culling, dirty-cell invalidation, and timing seams; verify the repository test command passes with the new coverage.
- [x] 5.2 Add bounded diagnostic validation for substantially farther zoom-out that records visible-cell counts, culling behavior, cache growth, and redraw/update work; verify cache growth follows the configured glyph/font/zoom key space rather than total world area.
- [x] 5.3 Run the project build and manually compare browser rendering at zooms 1, 5, and 10 using curved, diagonal, and filled glyphs; verify zoom controls, palette styling, font selection, world readiness, and visible-only rendering remain functional.
- [x] 5.4 Record world-data, first-visible-render, total-readiness, cold-warmup, and cached-zoom-rerender measurements against their targets; verify the result is ready for OpenSpec verification before archive.
