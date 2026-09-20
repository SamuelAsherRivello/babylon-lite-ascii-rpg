# Proposal

## Why

The minimap currently reduces explored areas into grey aggregate documentation-like pixels, so it does not communicate the game's actual terrain, water, walls, or object graphics. Players need the minimap to be a recognizable miniature of the current game world, with navigation markers layered visibly above that world image.

## What Changes

- Replace grey/averaged minimap terrain rendering with the game's actual world graphics at minimap resolution, using explicit passes: world background first, world glyphs second, and markers last.
- Preserve fog-of-war visibility while rendering every eligible discovered world cell in the minimap viewport.
- Render the world graphics first, then draw start, torch, and player markers as a final overlay with deterministic depth ordering.
- Keep the existing minimap canvas footprint, click-cycle zoom levels, hidden numeric state, and persisted minimap zoom behavior.
- Add focused tests proving terrain graphics are retained and markers are painted over them.

## Capabilities

### New Capabilities

- `minimap-world-graphics`: Render a recognizable, fog-aware miniature of the actual game world with marker overlays.

### Modified Capabilities

- None.

## Impact

- Affects the Babylon Lite game-layer minimap renderer and its canvas drawing path.
- Reuses existing world glyph resolution, palette colors, fog discovery, and minimap zoom viewport state; no new dependency is expected.
- Adds focused Node coverage and manual browser verification of world graphics, marker layering, fixed canvas bounds, and existing zoom persistence.
