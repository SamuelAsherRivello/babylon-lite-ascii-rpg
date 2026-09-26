# Proposal

## Why

The generated world currently gives water three depth bands with different
traversal behavior and ASCII appearances. A single blocked water type with one
blue animated Tiled visual will make water readable and visually consistent.

## What Changes

- **BREAKING** Replace shallow, medium, and deep generated water with one
  canonical water depth in both realms; every generated water cell blocks
  player traversal and is excluded from valid player-start cells.
- Preserve seeded lake selection, lake sizing, generation-pass order, fog, and
  terrain layering while removing depth-band generation and shallow-water
  walkability.
- Add one blue, animated tile sourced from the project-local Tiled set and use
  it for every eligible water terrain cell; red and green variants are not
  used.
- Keep the water art presentation-only: it cannot change terrain coordinates,
  fog visibility, collision, occupancy, or overlay precedence.

## Capabilities

### New Capabilities

- `animated-water-tile-presentation`: Presents every eligible water terrain
  cell with the one approved blue animated Tiled tile while preserving shared
  world-view rules.

### Modified Capabilities

- `procedural-level-generation`: Replace the nested three-depth water and
  shallow-water traversal requirements with one seed-stable, non-walkable
  water terrain type.

## Impact

- Affected generation and terrain contracts: water-depth assignment,
  walkability, player placement, water glyph/palette compatibility, and
  deterministic generation assertions.
- Affected rendering: terrain-art asset qualification, frame animation,
  visible-water submission, and cached render invalidation.
- Uses the checked-in Tiled assets only; adds no dependency, map loader, or
  static-map migration.
- Verification will use focused Node tests, `npm.cmd run build`, strict
  OpenSpec validation, and a fixed-seed manual browser review. No Playwright
  files are added.
