# Proposal

## Why

The ASCII RPG currently rasterizes glyphs into a single 64x64 bitmap atlas and scales those bitmaps across the full zoom range. At zoom 1 the glyphs become too small to preserve recognizable shapes, while at zoom 10 the fixed raster resolution and pixelated sampling make curved forms look jagged. The renderer also rewrites every visible sprite on each world redraw, so the same work will become increasingly expensive as the visible area grows.

This change improves visual fidelity at every supported zoom and establishes bounded reusable rendering data so larger diagnostic and future gameplay levels remain practical.

## What Changes

- Add zoom-aware glyph visuals so each supported zoom level can use an appropriately rasterized or reconstructed glyph shape instead of blindly scaling one bitmap.
- Cache reusable glyph visuals by font, glyph identity, and zoom level, with invalidation when the selected font changes.
- Populate that cache lazily, warming only the glyphs needed by the current visible region first and expanding on demand.
- Preserve palette color and opacity as client tint/style data rather than multiplying the cache for every color combination unless profiling demonstrates a compelling need for precomposed styles.
- Preserve zoom 1 as the current furthest user-facing zoom and zoom 10 as the current closest user-facing zoom, while allowing separate diagnostic stress values below zoom 1 during validation.
- Improve redraw efficiency through visible-region handling, dirty-cell or dirty-region updates, and reusable sprite property/style data.
- Make the end-to-end initial world operation—building the complete world data and rendering the current visible region—complete in under 1 second, with an ideal baseline target of approximately 0.1 seconds.
- Build world data cooperatively across frames so the main thread remains responsive while still measuring the total time to a complete valid visible frame.
- Keep the existing completed-world generation contract available for deterministic tests and non-interactive callers while adding a cooperative client path.
- Ensure zoom-change rerenders rebuild only the visible region; world generation and off-screen world data must never be part of a zoom-change render operation.
- Add performance-oriented coverage for extreme visible-cell counts, including measurements or checks for culling, cache reuse, sprite updates, and memory growth.
- Keep future animation and shader effects outside the static glyph cache so cached shape data remains reusable.

## Capabilities

### New Capabilities

- `zoomed-glyph-rendering`: Zoom-aware glyph fidelity, glyph-visual caching, visible-region redraw behavior, and rendering performance diagnostics.

### Modified Capabilities

None. Existing palette editing, top-most cell precedence, and React/Babylon Lite ownership remain contractually unchanged.

## Impact

- Affected client code: the Babylon Lite game-layer renderer, viewport/zoom helpers, glyph atlas creation, sprite update path, and related focused tests.
- Affected browser behavior: glyph edges and silhouettes should remain clearer at zooms 1, 5, and 10; zoom controls and palette/font editing should continue to behave as before.
- Affected resources: a bounded in-memory cache of glyph visuals, likely with one or more resolution tiers per configured font.
- Dependencies: no new dependency is assumed. A custom shader or alternate atlas sampling strategy may be evaluated during implementation if it improves fidelity without violating the existing Babylon Lite boundary.
- Validation: existing Node tests and build checks remain required, with focused rendering/cache/culling checks and manual browser comparison at representative and diagnostic zooms.
- Performance acceptance: instrument initial readiness from world-generation start through complete world-data availability and the first correctly rendered visible region; target less than 1 second and pursue approximately 0.1 seconds on the baseline development machine. Also measure cached zoom-change request through visible-region submission against approximately 16.7 ms.
