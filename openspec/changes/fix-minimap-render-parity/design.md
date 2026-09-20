# Design

## Context

The active minimap renderer currently reduces each coarse 10-by-10 world area and chooses a single representative glyph for that area. The game renderer instead resolves every visible world cell through the shared world-glyph and palette path before submitting its visual. The existing minimap zoom state already supplies a player-centered source viewport, and markers already have a defined overlay order.

## Goals / Non-Goals

**Goals:**

- Share the game renderer's per-cell glyph/color resolution with the minimap.
- Keep view `1`, `5`, and `10` as scale/crop variants of the current game viewport composition.
- Preserve the explicit background → glyph → marker passes and fog gate.
- Keep the minimap canvas dimensions and game zoom independent.
- Preserve the game renderer's cell footprint when placing minimap cells; the fixed minimap canvas must not determine cell size by stretching the selected source region.

**Non-Goals:**

- Replacing the Babylon game renderer or changing the world model.
- Moving the player/camera when the minimap is clicked.
- Adding minimap labels or changing marker semantics.

## Decisions

### Use the current game viewport as the minimap source

The minimap will iterate the same visible-region cells used by the game renderer and resolve each cell through the same visible-glyph and palette contract. At minimap zoom `1`, the source region and cell arrangement match the game view; higher levels crop that region around the player. This is required for visual parity; a coarse reducer cannot preserve the layout shown in the game view.

### Share rasterized glyph assets, adapt only placement and tint

The minimap will consume the same rasterized glyph pixel data produced for the game's glyph visual cache, then place and tint those pixels per world cell in the minimap canvas. It will not copy the complete game render texture and will not call a new canvas `fillText` path at minimap-sized fonts. The world-cell identity, raster shape, color, ordering, and crop must match; only the raster footprint is adapted to the fixed minimap canvas.

### Keep minimap zoom as a crop of the game viewport

Zoom `1` maps the current game viewport into the minimap footprint. Zoom `5` and `10` select smaller player-centered source regions from that viewport and rasterize those cells into the same canvas dimensions. CSS transforms and game `setZoom` remain out of scope.

### Use fixed-footprint placement instead of fill-to-canvas scaling

The minimap SHALL derive its cell width and height from the same zoom-scaled grid dimensions used by the game renderer, adjusted only for the minimap canvas pixel density. It SHALL not calculate cell dimensions as `canvasSize / sourceCellCount` when that would enlarge cells beyond the matching game zoom. Source positioning SHALL remain player-centered and bounded; cells that do not fit may be cropped, while remaining canvas space may be letterboxed.

## Risks / Trade-offs

- [Per-cell minimap work costs more than coarse reduction] → Bound work to the selected viewport, skip undiscovered cells, and test the production-sized world path.
- [Canvas text may not be pixel-identical to Babylon sprites] → Share glyph identity, palette color, viewport, and ordering, then verify screenshots at all three minimap zooms.
- [Shared atlas frames are GPU-oriented] → Expose/reuse the glyph raster pixel source at the cache boundary and use nearest-neighbor-safe canvas image data for the minimap.
- [Fog can make the minimap differ from the full game view] → Treat fog as an explicit intended difference and test undiscovered-cell suppression.

## Migration Plan

No persisted-data migration is required. Existing minimap zoom values remain valid. Rollback restores the prior minimap renderer while leaving the bridge, settings, and marker contracts intact.
