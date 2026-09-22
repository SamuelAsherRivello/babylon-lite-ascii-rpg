# Proposal

## Why

The minimap currently allows the origin and player markers to appear through fog, even though the minimap's world graphics are discovery-gated. This leaks gridspot information and breaks the intended fog-of-war contract; every minimap marker should only render when its exact world gridspot is unfogged.

## What Changes

- Gate origin and player minimap markers on exact-cell discovery, matching the existing torch-marker behavior.
- Align every marker to its exact world gridspot so the player marker overlays the rendered `P` glyph.
- Limit player-driven unfogging to a fixed 20-gridspot line-of-sight radius instead of the lighting profile.
- Preserve the existing marker depth order and solid marker colors when a marker is eligible to render.
- Add focused regression coverage for hidden origin/player cells and their appearance after discovery.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `minimap-markers`: Require every minimap marker to render only when its corresponding exact world gridspot is discovered/unfogged.

## Impact

- Affected implementation: `ascii-rpg/src/client/game-layer-babylon-lite/systems/minimap-renderer.js`.
- Affected verification: `ascii-rpg/test/client/game-layer-babylon-lite/systems/minimap-renderer_tests.mjs` and the repository's existing Node test/build checks.
- No new dependencies, public APIs, world-generation changes, or UI settings are required.
