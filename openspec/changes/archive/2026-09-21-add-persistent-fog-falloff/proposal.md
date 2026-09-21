# Proposal

## Why

The current fog system treats each cell as either fogged or fully discovered,
which makes the boundary of the player's sight radius abrupt and removes the
visual sense of distance. The game needs persistent, percentage-based
visibility so newly revealed cells communicate their distance from the player
while retaining the highest visibility they have previously reached.

## What Changes

- Replace the boolean per-cell discovery value with a persistent visibility
  value from `0` to `100`, where `0` is fully fogged and `100` is fully
  unfogged.
- Calculate visibility for clear cells inside the player's existing
  realm-specific fog radius using `100` through `70%`, `75` through `80%`,
  `50` through `90%`, and `25` through the radius edge.
- Preserve the maximum visibility ever reached for each cell during the world
  session; visibility SHALL NOT decrease when the player moves away.
- Continue to require a clear straight light path and preserve existing wall
  blocking and unwalkable-cell rules.
- Render game-view cells with opacity matching their persistent visibility,
  while keeping cells at `0` hidden.
- Calculate minimap coarse-area opacity from the persistent visibility values
  of its eligible walkable cells rather than treating every revealed cell as
  fully opaque.
- Preserve world reset behavior, realm-specific radius values, shared fog
  authority, minimap zoom, markers, lighting, and render pass ordering.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `fog-of-war-minimap`: Change discovery from boolean state to persistent
  percentage visibility and use those values for minimap opacity.
- `world-view-rendering`: Render eligible cells at their persistent fog
  visibility opacity while retaining hidden-cell slot reconciliation.

## Impact

- Fog state and discovery calculations in the Babylon Lite game layer.
- Shared world-view composition and game sprite submission, including alpha
  handling and render invalidation when visibility increases.
- Minimap aggregation and glyph presentation opacity.
- Focused fog, world-view, minimap, and rendering tests, plus the existing
  Node test suite and manual browser verification.
- No new dependencies, persisted user settings, world-generation changes, or
  React/bridge API changes are expected.
