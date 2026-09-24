# Design

## Context

See proposal.md for motivation. The current minimap renderer derives independent `cellWidth` and `cellHeight` from the canvas and source region, while the React/bridge settings already persist related UI preferences and the fog system owns discovery state.

## Goals / Non-Goals

**Goals:**

- Fit the selected world region into the existing minimap rectangle using one uniform scale and centered offsets.
- Route a persisted fog visibility snapshot from settings to the game layer.
- Keep discovery data authoritative and avoid mutating it when fog display is toggled.

**Non-Goals:**

- Changing the minimap's CSS size or the game world's generated aspect ratio.
- Changing game viewport zoom, camera behavior, or fog discovery radius.
- Adding a second fog system or new dependency.

## Decisions

- Compute a uniform cell size from the smaller of the available canvas width/column count and height/row count. Center the rendered map rectangle and clear/paint the surrounding letterbox area with the minimap background. This avoids independently scaling glyph rasters on each axis.
- Keep the renderer's existing background → glyph → marker passes. When fog is disabled, bypass fog suppression for minimap presentation only; when enabled, continue using the existing discovery queries.
- Persist fog in the React settings layer, send a boolean bridge snapshot, and expose a game-layer setter that schedules only a minimap redraw. This keeps UI ownership, transport, and rendering boundaries consistent with minimap visibility and zoom.
- Treat marker visibility as part of minimap presentation: fog-enabled mode uses existing discovered-cell rules, while fog-disabled mode can show all applicable world markers without altering world state.

## Risks / Trade-offs

- [Risk] Letterboxing may leave visible empty bands in strongly mismatched aspect ratios → Mitigation: center the map and keep the background explicit so the distortion-free result is predictable.
- [Risk] Fog-disabled maps may reveal more markers than before → Mitigation: scope the behavior to the minimap display and cover it with focused tests; discovery remains unchanged.

## Migration Plan

Existing users without a saved fog preference receive the enabled default. Existing minimap zoom, visibility, and aspect preferences remain compatible. Reset Settings removes the new key along with other persisted settings.
