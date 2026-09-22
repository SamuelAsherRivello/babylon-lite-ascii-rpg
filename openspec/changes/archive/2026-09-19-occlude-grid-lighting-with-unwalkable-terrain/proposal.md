# Proposal

## Why

Player and torch light currently brightens every cell inside its radius, even
through walls and other unwalkable terrain. The existing palette lighting looks
good, but blocked terrain should cast clear grid shadows so the light reflects
the cave layout.

## What Changes

- Make every unwalkable terrain cell block player and torch source light beyond
  it. The first blocking cell can receive light on its source-facing side;
  cells behind it receive only ambient light unless another source reaches them.
- Use straight shadows. Light does not travel around corners. The `X High`
  shadow preset preserves fully blocked shadows, while lower shadow presets
  retain progressively more source light beyond unwalkable terrain.
- Keep the ambient setting, palette modulation, and independent Torch and
  Player controls. Both source-light controls expose the same five fixed
  presets: `Off`, `Low`, `Med`, `High`, and `X High`, each displaying its
  radius, maximum, and falloff. Torch and Player each gain an independent
  five-preset Shadow control that displays terrain occlusion and shadow bleed,
  progressing from `O0 B1` through `O1 B0`. Ambient light remains level-wide,
  including in shadows.
- Refresh the visible shadow pattern when the player moves or lighting inputs
  change, without changing terrain walkability, torch placement, or movement.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `palette-grid-lighting`: Replace the explicit no-occlusion behavior with
  terrain-aware source visibility and shadow acceptance criteria.

## Impact

- Affected game layer: `ascii-rpg/src/client/game-layer-babylon-lite/lighting.js`
  and the visible-cell lighting path in `index.js`, using the existing
  `world.terrain[y][x].walkable` data.
- Affected checks: focused lighting and visible-render tests, the existing Node
  suite and build, and a manual browser check with walls and blocked water.
- New Torch Shadow and Player Shadow settings use the existing UI, bridge, and
  stored-setting patterns. No dependency, Babylon light object, or world-data
  format is needed.
