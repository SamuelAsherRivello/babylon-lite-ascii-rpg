# Proposal

## Why

The game view and mini-map currently implement similar world composition logic
through separate rendering paths. This allows viewport cropping, glyph
selection, scaling, and fog behavior to drift between the two views, even
though both are presentations of the same world state.

## What Changes

- Add a reusable world-view renderer that can render a bounded world rectangle
  into a supplied target layer or surface.
- Pass each view's source world rectangle, destination rectangle, scale, and
  presentation parameters into the shared renderer rather than maintaining
  separate world-composition algorithms.
- Make the game world view and mini-map world view use the same background,
  fog eligibility, glyph selection, and world-cell render pipeline.
- Require both views to respect the same per-realm fog-of-war discovery state;
  neither view may bypass fog filtering for world cells.
- Preserve view-specific capabilities through arguments, including Babylon
  lighting, mini-map scaling, target-specific raster submission, and optional
  mini-map marker overlays.
- Keep mini-map markers as an optional final overlay after the shared world
  background and glyph passes.
- Preserve persistent discovery for the active realm and the current game and
  mini-map presentation behavior outside the shared-renderer refactor.

## Capabilities

### New Capabilities

- `world-view-rendering`: Shared bounded world-cell composition for the game
  world view and mini-map world view, including common fog filtering and
  configurable presentation capabilities.

### Modified Capabilities

- `game-layer-architecture`: Babylon Lite owns reusable rendering for both
  world views and their shared per-realm fog state.
- `minimap-render-parity`: Mini-map parity is based on the shared world-view
  composition while allowing an explicitly supplied mini-map source rectangle
  and view-specific scale or overlays.

## Impact

- Affected Babylon Lite renderer, visible-region utilities, fog integration,
  glyph-cache usage, and mini-map canvas path under
  `ascii-rpg/src/client/game-layer-babylon-lite/`.
- Affected focused renderer, fog, mini-map, and game-layer tests under
  `ascii-rpg/test/client/game-layer-babylon-lite/`.
- No new dependencies, React-owned world state, or public bridge data are
  required.
- Existing lighting, camera, zoom, realm, and marker behavior must remain
  compatible except that both world views now suppress undiscovered cells.

