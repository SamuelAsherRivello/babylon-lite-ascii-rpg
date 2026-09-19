# Implementation verification

## Representation decision

Selected lazy per-zoom monochrome glyph atlases, with per-instance palette tint and alpha. Each zoom uses a raster footprint close to twice the CSS cell width; distant glyphs are generated at double that footprint and downsampled before atlas upload. Linear atlas sampling smooths the final fractional-pixel placement. The static cache key is effectively active font + glyph + zoom, with font changes disposing the old cache. Color, alpha, and future shader/animation parameters stay outside the shape cache.

An SDF/mask shader path was considered. It could share a high-resolution shape across scales and enable outline effects, but would require a custom Babylon Lite shader path and distance-field generation. At six-ish screen pixels per cell at zoom 1, reconstruction cannot recover more output pixels; it can also erode thin ASCII strokes. The per-zoom raster path produced recognizable map silhouettes at 1, the existing readable appearance at 5, and visibly rounded bullets/curves at 10 in the browser, without a new dependency. No pixel-for-pixel SDF prototype was added; this is an architectural and visual assessment, not a measured SDF-vs-raster benchmark.

## Measurements

Measured in local Chrome/WebGPU at a 1138×590 CSS-pixel viewport with a seeded 512×512 `production-world` and the saved Lucida Console font. These are CPU submission timers reported by the app, not GPU-present or FPS measurements. Chrome's browser-control session often displayed roughly 1 FPS, so it is not a trustworthy gameplay frame-rate benchmark.

| Operation | Observed | Target | Result |
| --- | ---: | ---: | --- |
| Complete world data, three final seeded runs | 925.6, 905.1, and 817.4 ms | Part of sub-1000 ms readiness | Within budget |
| First visible 630-cell render, including seven cold glyphs | 5.8, 4.6, and 4.7 ms (3.2, 2.9, and 2.5 ms glyph warmup) | Part of sub-1000 ms readiness | Within budget |
| Total seeded readiness | 931.7, 909.8, and 822.3 ms | <1000 ms; ~100 ms ideal | Primary target met in these runs; ideal missed |
| Cold zoom 10 glyph warmup | 4.2 ms | Separately reported | Not charged to cached rerender |
| Return to cached zoom 10; 153 visible cells | 0.3 ms | ≤16.7 ms | Met |
| Return to cached zoom 1; 16,284 visible cells | 6.8 ms | ≤16.7 ms | Met |
| Cold zoom 1; 16,284 visible cells | 22.0 ms warmup + 11.5 ms other submission work | Cold warmup separate from frame budget | Measured |

The full world contains 262,144 cells. Only 630 sprites were initially submitted at zoom 5; zoom 1 submitted 16,284 and zoom 10 submitted 153. At a diagnostic zoom of 0.5 (not exposed in the UI), the same viewport would intersect 65,320 cells, still less than the world; the visibility and cache tests assert those exact counts and bounds. Seven glyphs across zooms 0.5, 1, 5, and 10 consumed 888,832 estimated RGBA atlas bytes, independent of the total world-cell count. The ten normal zoom atlases are bounded to about 2.9 MB for the seven current glyphs at the configured atlas width, and changing fonts disposes the previous set.

The ~100 ms ideal is not realistic for this complete procedural 512×512 world on the measured browser setup; generation remains the dominant cost. The subsecond primary target was met in the three seeded runs above, but should be treated as a device-dependent target, not a guarantee. The generation log includes per-pass timings, yield counts, and scheduling wait so future regressions can be attributed. A small movement updates at most its old and new cells when the view origin is stable; a view shift, resize, font change, or zoom change refreshes only the visible region. Palette updates touch matching visible sprite tint/alpha without rebuilding glyph shapes.

## Validation

- `npm.cmd test`: 49/49 passed, including seeded synchronous/cooperative equality, cancellation/replacement, cache and tint reuse, eviction, dirty-sprite decisions, culling, and diagnostic half-zoom bounds.
- `npm.cmd run build`: passed.
- Local browser: visually checked zooms 1, 5, and 10; glyph roundness, water curves, filled symbols, palette colors, zoom controls, and font preview/cancel. The font preview was canceled without changing the saved font.
- `openspec.cmd validate improve-zoomed-glyph-rendering --strict`, `openspec.cmd validate --specs`, and `git diff --check`: passed before archive. The synced main spec was compared with the delta, and the completed change was archived on 2026-09-19.
