# Design

## Context

See `proposal.md` and the `glyph-background-layout` delta for the user-visible behavior. The existing React `PromptWindow` owns the Ascii Settings tabs, the game bridge forwards palette/font preferences, and the Babylon Lite game layer renders visible cells from a cached glyph atlas. `renderWorldView` already rejects undiscovered cells before calling the cell renderer, while `applyLightingToColor` currently modulates each submitted glyph sprite.

## Goals / Non-Goals

**Goals:**

- Add the Layout tab and two persisted preferences without changing existing Glyphs or Fonts behavior.
- Keep defaults deterministic: Glyph Background On and Background Darkness 50.
- Produce one composited cell visual so lighting is applied after the background and glyph have been combined.
- Reuse the current visible-region, zoom, font, palette, fog, and shared game/mini-map presentation boundaries.
- Keep the mini-map visually aligned with the game view for glyph backgrounds and apply the shared GPU light samples when that pass is enabled.
- Invalidate only the visible presentation data needed when a layout preference or palette color changes.

**Non-Goals:**

- No changes to world generation, fog discovery, terrain, collision, minimap crop/marker rules, or gameplay state.
- No alpha/transparency control for the background.
- No new dependency or shader-based lighting path.
- No persistence of world or glyph progress beyond the two browser preferences.

## Decisions

1. **Keep Layout state in the React settings surface and forward it through the existing bridge boundary.** React will own local-storage initialization, control state, and preference updates; the game layer will receive validated snapshots and request a visible redraw. This preserves the current UI/game separation and avoids React touching per-cell state.

2. **Use integer normalization for the slider.** Values are clamped to `0..100`, stored as decimal strings, and mapped with `backgroundChannel = glyphChannel * (1 - darkness / 100)`. Invalid stored values fall back to `50` and are repaired in storage.

3. **Use a runtime composite visual rather than two independently lit sprites.** The composite path will create a grid-sized opaque background and the glyph from the same palette color, then expose the combined cell visual to the existing sprite submission. This is preferred over a second background layer because the requirement applies lighting once after compositing; it also ensures the glyph/background relationship remains stable under lighting.

4. **Keep reusable glyph shape data separate from color and layout state.** The existing zoom/font glyph cache remains responsible for bounded glyph shape reuse. A color/layout-aware composite cache or raster composition step may reuse those shapes, but palette color, darkness, and the enabled flag remain render-time inputs and must not create unbounded cache growth.

5. **Share the existing fog gate and slot reconciliation.** The game-view callback will continue to hide a slot before any cell composition when `discovered` is false. A discovered space glyph still receives a background because it is a rendered cell in the shared world-view composition.

6. **Apply the existing cell lighting after composition.** The composed visual receives the same lighting factor used by the current glyph path. Palette data remains unchanged, and lighting remains transient and visible-cell bounded.

7. **Use one visual source for both views.** The mini-map glyph cache uses the same composite rasterizer as the game cache, while its canvas destination remains responsible only for scale. Its optional light overlay consumes `buildGpuLightPassSamples` for the mini-map source region and draws the same additive light color before markers.

## Risks / Trade-offs

- [Risk] A colorized composite can increase raster work when palette colors or darkness change. → Reuse glyph shape rasters, rebuild only the active zoom/font composite data, and measure visible-cell warmup separately from world generation.
- [Risk] Toggling the background can leave stale composite sprites visible. → Invalidate the visible render state and force a complete current-region submission whenever either preference changes.
- [Risk] Existing source tests may assume one glyph frame per cell. → Extend focused rendering tests to cover composite frame creation, darkness endpoints, toggle invalidation, and fog hiding.
- [Risk] A palette edit can change both glyph and background colors. → Treat palette updates as a composite-style invalidation while preserving the existing palette synchronization and warning behavior.
- [Risk] The mini-map is a separate 2D canvas and cannot attach the Babylon sprite layer directly. → Reuse the exact GPU light sample builder and light color, then render those samples as a destination-scaled additive radial overlay on the mini-map before markers.

## Migration Plan

No data migration is required. On first load, missing or invalid layout keys are initialized to `true` and `50`. Existing users keep the current glyph-only experience only if they explicitly select `Glyph Background: Off`; Reset Settings clears the keys and restores the new defaults. Rollback can remove the UI and bridge preference path without changing world or palette data.
