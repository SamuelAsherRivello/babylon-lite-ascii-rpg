# Design

## Context

See proposal.md. The Babylon Lite game layer owns the minimap canvas, player cell, generated world, and fog state. The minimap renderer already converts the fixed 10:1 world grid to fog-masked world-content pixels; `world.playerStart`, `world.torches`, and exact-cell discovery provide all marker inputs.

## Goals / Non-Goals

**Goals:**

- Add a small, deterministic marker-composition pass without weakening the current fog mask.
- Keep marker policy testable independently of the DOM canvas and leave ownership in the Babylon Lite game layer.

**Non-Goals:**

- No marker interaction, labels, legend, persistence, configuration, or new marker types.
- No changes to world generation, player movement, camera behavior, fog discovery, or React settings and bridge interfaces.

## Decisions

### Derive markers from existing authoritative session state

The minimap renderer will receive the generated world's immutable start and torch coordinates, the current player cell, and fog state. It will map each world coordinate to the existing coarse minimap grid and return/render only the applicable colored dots. This avoids duplicating state or persisting marker history.

Alternative: store a separate marker registry on the world. Rejected because all requested markers are already derivable and a registry could become stale after player movement or a regenerated world.

### Gate torches by exact-cell discovery

The renderer will test each torch coordinate against the existing exact-cell fog record rather than treating any nonzero coverage in its 10 by 10 area as discovery. This preserves the requested distinction between a discovered torch and nearby revealed terrain.

Alternative: use the coarse coverage ratio. Rejected because it would reveal torches before the player unfogs the torch's own cell.

### Paint markers after world-content pixels in fixed priority order

The minimap canvas uses a fixed back-to-front depth contract: black base at 0, fog-masked world content at 10, green start at 20, discovered white torches at 30, and yellow player at 40. Later paint wins for a shared coarse minimap pixel, ensuring the player stays visible over both start and torch markers. Dots will be painted at the existing pixel scale with full alpha so marker colors are not dimmed by fog coverage.

Alternative: blend marker colors or create multi-pixel badges. Rejected because the minimap is deliberately pixel-preserving and the user specified yellow visibly on top of green.

## Risks / Trade-offs

- [Multiple world coordinates can share one coarse minimap pixel] -> fixed paint priority produces a stable, legible result; individual marker identity inside a 10 by 10 area is intentionally not expanded.
- [World-content composition currently contains actor glyph colors] -> marker paint occurs after content, so the explicit marker colors remain authoritative at their mapped locations.
- [Large worlds contain many torches] -> iterate the existing generated torch collection only during the minimap refresh path, which already redraws the coarse canvas.

## Migration Plan

1. Add marker derivation and canvas composition beside the existing minimap renderer.
2. Cover mapping, exact fog eligibility, color, and overlap precedence with focused Node tests.
3. Deploy without data migration because marker state is derived from the current generated world and session fog.
4. Rollback removes the marker pass; fog and world-content minimap behavior remain intact.
