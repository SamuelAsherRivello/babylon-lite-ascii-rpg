# Proposal

## Why

The current world generator combines cave creation, connectivity selection,
terrain construction, and player placement in one procedural function. That is
enough for the first cave, but it makes future world-generation features hard
to add without coupling them to existing rules. The game also needs its first
additional terrain type: an organic water body with visible depth bands and
shallow-water traversal.

## What Changes

- Refactor world generation into deterministic, ordered passes over shared
  terrain layers.
- Establish the initial pass order as ground, cave/walls, water, walkability,
  and player position.
- Keep the cave pass responsible for the existing bordered cellular-automata
  wall shape, wall-fill percentage, smoothing, and connected-region inputs.
- Add a water pass that claims approximately 20% of the surviving interior
  ground as multiple independent organic lakes, with each lake targeting
  roughly 5-20 grid cells.
- Represent water depth with three terrain glyphs: `~` for shallow water,
  `≈` for medium water, and `▓` for deep water.
- Give the three water glyphs default light-blue, medium-blue, and dark-blue
  styles respectively.
- Make shallow water walkable while medium and deep water are blocked.
- Derive and validate the final walkable region after water is applied, then
  place the player on a valid connected walkable cell.
- Preserve deterministic seeded generation and stable resize redraws.
- Keep water in the terrain layer, preserving the separate character layer and
  top-most character rendering precedence used by the player and torches.
- Add focused tests for pass ordering, deterministic water layout, approximate
  water coverage, nested depth bands, colors, walkability, and player safety.

## Capabilities

### New Capabilities

- `world-generation-passes`: Defines the ordered, deterministic pass pipeline
  and shared layer contract for future world-generation features.

### Modified Capabilities

- `procedural-level-generation`: Extends generated terrain with organic,
  depth-aware water and derives connectivity/player placement after water.

## Impact

- Affected client code is centered on
  `ascii-rpg/src/client/game-layer-babylon-lite/systems/world-system.js` and
  the Babylon Lite glyph atlas/rendering setup in
  `ascii-rpg/src/client/game-layer-babylon-lite/index.js`.
- Palette defaults and map-glyph inventory will need to include the three water
  glyphs and their default blue colors.
- Existing player movement, character precedence, torch placement, and bridge
  boundaries remain intact, but their tests must run against the new terrain
  contract.
- No new dependency, persisted-world format, URL parameter, network behavior,
  or React API is required.
- The exact water coverage tolerance and the algorithm used to form the organic
  lakes are implementation details to be fixed in the design and verified by
  tests; the user-visible contract is approximately 20% aggregate coverage
  with small lakes and nested depth bands.
