# Design

## Context

See `proposal.md` for the motivation and user-visible outcome. The current Babylon Lite renderer creates a small fixed set of glyph frames from browser font rasterization, packs them with `createSpriteAtlasFromFrames`, and updates one sprite instance per visible cell. The viewport already limits iteration to visible rows and columns, while palette color and alpha are passed as per-sprite tint data. Zoom is currently bounded to integer levels 1 through 10, with zoom 5 retaining the existing 32px cell size.

The implementation must remain inside `game-layer-babylon-lite`; React continues to own only HTML UI and communicates through the existing bridge. No new dependency is required by this design.

## Goals / Non-Goals

**Goals:**

- Make glyph silhouettes intentionally appropriate to each supported zoom level.
- Reuse static glyph visual data across repeated cells and redraws.
- Keep palette tint and opacity independent from static glyph-shape caching.
- Preserve viewport culling and improve the amount of work performed after small world changes.
- Leave a clean boundary for future shader animation and time-varying presentation.
- Validate both visual fidelity and performance at normal and diagnostic visible-cell counts.
- Meet an end-to-end readiness target of less than 1 second, with approximately 0.1 seconds as the ideal baseline for complete world data plus the first visible-region render.
- Meet a separate approximately 16.7 ms target for resubmitting the visible region after a cached zoom change.
- Keep normal generation and test determinism intact while adding a cooperative runtime generation path.

**Non-Goals:**

- Changing the user-facing zoom range from 1 through 10.
- Changing palette editing, font choices, world-generation rules, or top-most glyph precedence.
- Pre-rendering a unique full-color image for every world cell.
- Adding a new rendering dependency or replacing Babylon Lite with another engine.
- Making diagnostic zoom values part of the shipped user controls unless a later change explicitly requests that.
- Guaranteeing the ideal 0.1-second target on every device; the implementation must measure it and report misses honestly.
- Guaranteeing the 16.7 ms zoom-change target on every device or including first-time glyph generation in that budget; those costs must be measured separately.
- Changing the public behavior of the existing synchronous world builder solely to support runtime yielding; a separate resumable/cooperative entry point is preferred.

## Decisions

### Use zoom-keyed glyph visuals, not one universally scaled bitmap

The renderer will resolve a glyph visual using a key equivalent to `font + glyph + zoom`. Each supported zoom level may use its own raster size, sampling treatment, or silhouette adjustment. This directly addresses the two failure modes: excessive information loss when shrinking toward zoom 1 and visible raster limitations when enlarging toward zoom 10.

An implementation may use oversampled raster frames, multiple atlas tiers, an SDF-like mask, or a combination after a focused visual spike. The externally required behavior is the zoom-appropriate result; the selected representation must be measured against zooms 1, 5, and 10 before it is finalized.

Alternative rejected: scaling the current 64x64 frame for every zoom. It preserves the smallest implementation but cannot provide independent low-zoom silhouette decisions or higher-zoom contour detail.

The first implementation should use a representation-neutral resolver so the visual spike can compare per-zoom raster frames and an SDF/mask shader without changing world-cell or palette code. The resolver should warm only the glyphs required by the visible region before the first frame; it should not prebuild every Code Page 437 entry at startup.

### Keep palette tint outside the glyph cache

Glyph frames remain neutral or base-color shape data. Palette color and alpha continue to be resolved as per-sprite style/tint data. A style lookup may be cached separately by glyph and palette revision, but the cache will not multiply entries by every color/opacity combination by default.

Alternative rejected: precomposing every color and opacity combination. It could reduce some per-instance style work, but it increases memory, complicates live palette edits, and would be a poor fit for future animated coloration.

### Separate static visual reuse from dynamic cell updates

The renderer will retain reusable glyph-frame and resolved-sprite-property data, while tracking whether a cell's visible glyph, style revision, position, viewport membership, font, or zoom changed. A small movement should update the affected cells and any required viewport shift; a zoom, resize, font change, or atlas rebuild may refresh the visible region.

The existing sprite-layer instancing model remains the GPU submission mechanism. The first implementation should measure whether dirty-cell bookkeeping materially reduces CPU and upload work before introducing more complex chunk texture rendering.

Alternative considered: precomposed textures for every terrain chunk. This is reserved as a later LOD strategy for extreme zoom-out because it adds chunk invalidation and camera-boundary complexity.

### Preserve and measure viewport culling

Visible-region calculation remains the first culling boundary. Diagnostic zooms below 1 will be used only to expose large visible regions and identify bottlenecks. The renderer must still clamp iteration to world bounds and must not allocate cache entries based on world area.

If measurements show that per-cell instance updates remain the bottleneck, a follow-up optimization can divide the world into chunks and keep static terrain and dynamic character overlays in separate layers. That is compatible with the cache boundary and does not need to be introduced speculatively in the first implementation.

### Build world data cooperatively, then render only the visible result

World construction will be organized as resumable generation work: each major pass and any large row/cell loop will run in bounded slices, then yield through the browser task scheduler before continuing (`scheduler.yield` when available, a zero-delay timer otherwise). This gives rendering and input an opportunity to run without making completion depend on animation frames that can be heavily throttled. The runtime will expose a world only after terrain, walkability, characters, player start, and other required generation outputs are complete. Until then, it may show an inert loading/blank game surface, but it must not submit partially generated off-screen or on-screen cells as a playable world.

The readiness timer will begin when generation starts and end after the first valid visible-region render is submitted. The implementation will separately record data-build time, visible-render time, and total readiness time so a sub-one-second miss can be attributed to generation, glyph preparation, sprite submission, or scheduling. Rendering remains strictly viewport-bounded during the final visible-frame step; generation of off-screen world data is not permission to render it.

Alternative rejected: rendering partial terrain as it is generated. That could produce an earlier visual, but it risks showing invalid connectivity, player placement, water/torch overlays, or stale cells and would make the readiness contract ambiguous.

The existing deterministic completed-world builder should remain usable for focused tests and other synchronous callers. The runtime path should wrap or refactor its passes into a resumable builder that yields after bounded row/cell work and between generation attempts. Each slice should use a small time budget rather than a fixed cell count alone, because smoothing, flood-fill, and lake selection have different costs. A replacement request must invalidate the previous builder so a slower stale result cannot publish after a newer world request.

The renderer should be initialized independently of world publication, but it should render an inert blank/loading surface until the completed world is available. Once published, the first render should iterate only the viewport intersection with world bounds and warm only the glyph visuals needed by those visible cells.

### Treat performance targets as separate budgets

Measure three distinct intervals: complete world-data construction, first visible-region submission, and total readiness from generation start through that submission. For zoom changes, measure a fourth interval from zoom request to visible-region submission. The 1-second target applies to total initial readiness; approximately 0.1 seconds is an ideal baseline goal, not a universal guarantee; approximately 16.7 milliseconds applies to cached zoom rerenders, while cold glyph warmup is reported separately.

### Keep future effects at presentation time

Static cache entries will contain glyph shape/base appearance. Animation, time-based coloration, outlines, glow, and similar effects will be applied by sprite properties or a custom shader at draw time. This avoids baking a time dimension into the cache and preserves reuse across future visual systems.

## Risks / Trade-offs

- [Risk] Ten zoom levels multiplied by all configured fonts and the complete palette could grow larger than the current tiny atlas. -> [Mitigation] Use compact monochrome/base-mask data where possible, measure cache bytes, and bound keys to active fonts and supported zooms.
- [Risk] A zoom-specific raster can look inconsistent between adjacent zoom levels. -> [Mitigation] Compare all levels in a visual matrix and use shared generation parameters or tier transitions where the difference is distracting.
- [Risk] Dirty-cell tracking can become more complex than the current full visible redraw. -> [Mitigation] Preserve a full-refresh path for viewport/font/zoom changes and add focused tests for invalidation; use profiling to justify further granularity.
- [Risk] Custom shader or non-nearest sampling can soften the intended ASCII aesthetic. -> [Mitigation] Treat sampling/shader choice as a measured visual spike and retain the simpler atlas path as a fallback within the same cache interface.
- [Risk] Diagnostic extreme zooms may expose browser or GPU limits unrelated to normal gameplay. -> [Mitigation] Keep them out of user-facing controls and report them as stress-test results rather than supported gameplay guarantees.
- [Risk] The approximately 0.1-second ideal may not be achievable for a full 512x512 world on every device. -> [Mitigation] Treat under 1 second as the primary target, instrument the generation/render split, and report baseline and constrained-device measurements separately.
- [Risk] The 16.7 ms zoom-change target may be missed when a zoom cache is cold or the viewport contains many cells. -> [Mitigation] Separate cache-warmup from cached rerender timing, keep zoom changes viewport-bounded, and report both measurements.

## Migration Plan

1. Add the cache and zoom-aware visual resolution behind the existing game-layer renderer while preserving the current zoom API and palette/font bridge.
2. Validate focused unit behavior, build output, and manual browser screenshots or visual comparisons at zooms 1, 5, and 10.
3. Run diagnostic stress validation below zoom 1 and record cache size, culling, redraw, and frame-time observations.
4. Measure complete-world-data time, first-visible-render time, and total readiness time against the under-1-second target and approximately 0.1-second ideal.
5. Measure cached zoom-change request-to-visible-region submission against the approximately 16.7 ms target, separately recording cold-cache warmup time.
6. If the new path regresses visual quality or runtime stability, retain the existing renderer path behind the same internal resolution boundary until the cache representation is corrected; no data migration is required.
