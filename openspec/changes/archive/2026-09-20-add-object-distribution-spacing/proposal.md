# Proposal

## Why

Torches are currently selected by a torch-specific shuffle-and-slice routine, so
valid torches can cluster together and a future generated object would need to
copy the selection logic. A minimum separation makes torch landmarks more
evenly distributed while a type-based distribution entry point gives later
objects one clear extension path.

## What Changes

- Introduce a reusable generated-object distribution flow that identifies work
  as distributing an object of a named type, beginning with `torch`.
- Configure the `torch` distribution rule with a minimum Euclidean grid
  distance of 25 cells between every pair of selected torch instances.
- Apply the same rule in synchronous and cooperative world generation while
  retaining deterministic seeds, wall-adjacent walkable candidate rules,
  player-start exclusion, and torch character-layer output.
- Treat the requested torch count as a target: when a world cannot fit that
  many valid, 25-grid-spaced torches, return a deterministic valid subset
  rather than weakening the spacing rule.
- Add focused generator coverage for spacing, determinism, and equivalent
  synchronous/cooperative results.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `random-torch-placement`: Torch selection gains an explicit 25-grid minimum
  distance and is performed through the reusable typed object-distribution
  contract.

## Impact

- Affects `ascii-rpg/src/client/game-layer-babylon-lite/systems/world-system.js`
  and its Node generator tests.
- Does not add client dependencies, settings, or browser-facing controls.
- The 25-grid distance is interpreted as Euclidean cell-center distance, which
  matches the game's existing radial grid-lighting distance convention.
