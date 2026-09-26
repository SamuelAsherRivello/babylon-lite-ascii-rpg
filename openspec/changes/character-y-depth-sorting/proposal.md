# Proposal

## Why

Tall player and enemy sprites can overlap nearby characters, but the current
separate presentation layers give them fixed stacking precedence rather than
the conventional top-down RPG ordering. Characters farther down the map must
visually stand in front of characters farther up the map.

## What Changes

- Establish one game-view character presentation order for the player,
  enemies, and NPCs based on each actor's authoritative grid `y` position.
- Recompute the depth order whenever character positions or the visible region
  change, so movement and camera changes do not leave stale stacking.
- Keep character depth presentation-only: world coordinates, occupancy,
  movement, combat, fog, glyph identity, and mini-map/mapview behavior remain
  unchanged.
- Define a stable deterministic tie order for equal-`y` characters so their
  presentation does not flicker. This tie order is only a fallback; it does
  not override `y`-based depth.

## Capabilities

### New Capabilities

- `character-y-depth-sorting`: Defines top-down game-view depth ordering for
  player, enemy, and NPC character presentations.

### Modified Capabilities

- None.

## Impact

- Affects the Babylon Lite game-view character overlays and the NPC character
  presentation path in `ascii-rpg/src/client/game-layer-babylon-lite/index.js`.
- May adjust game-view overlay CSS in
  `ascii-rpg/src/client/ui-layer-react/map.css`.
- Adds focused Node rendering tests and manual browser verification with an
  explicit `randomSeed`; no new dependency, gameplay API, or renderer
  replacement is planned.
