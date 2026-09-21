# Proposal

## Why

The exploration minimap currently renders palette colors at full brightness and then applies the optional warm GPU light composite. The game view first applies the authoritative per-cell lighting factor, so equivalent cells appear darker and more natural in the game view than in the minimap. This violates the existing lighting contract and makes the minimap look as though light is being applied twice.

## What Changes

- Apply the authoritative cell lighting factor to each minimap glyph before it is rasterized onto the minimap canvas.
- Keep the minimap’s independent canvas and rendering flow; do not copy pixels or rendered frames from the game view.
- Keep the optional GPU light pass as a presentation overlay shared with the game view, but ensure it is not compensating for an unlit minimap base.
- Add focused coverage for ambient-only cells, lit cells, and GPU-pass parity so the minimap cannot regress to full-bright base colors.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `palette-grid-lighting`: Require the minimap base glyph color to receive the same authoritative lighting factor as the game view before any optional additive GPU light composite.

## Impact

- Affected runtime: `ascii-rpg/src/runtime/game-layer-babylon-lite/index.js` and the minimap rendering helpers.
- No new dependencies, persistence changes, world-data changes, or public API changes.
- Existing game-view lighting, minimap cropping, fog behavior, and independent canvas ownership remain unchanged.
