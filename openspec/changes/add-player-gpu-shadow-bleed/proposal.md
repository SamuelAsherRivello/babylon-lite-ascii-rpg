# Proposal

## Why

The GPU light pass currently softens lit cells into logically hard player
shadows, so at ambient `0` an unwalkable blocker can appear to leak player
light into cells that the grid lighting correctly marks dark. Players need a
small, intentional, adjustable shadow fringe rather than accidental blur.

## What Changes

- Add a persisted `Player GPU Shadow Bleed Range` setting with click-through
  values `0`, `1`, `2`, `3`, `4`, and `6` grid cells; default to `2`.
- Default a missing Player Lighting preference to `X High` and a missing Player
  Shadow preference to `High`; Reset Settings SHALL restore those defaults.
- Default a missing `Lighting GPU Light Pass` preference to enabled; Reset
  Settings SHALL restore that default while retaining any stored user choice.
- Preserve direct player light for unobstructed cells and fully mask the GPU
  player composite in the hard-shadow core at every ambient level; existing
  ambient illumination remains the only light there above ambient `0`.
- Add only a simulated, dim, rapidly fading player penumbra immediately behind
  the first unwalkable blocker, bounded by the selected bleed range.
- Keep torch contributions, stored user choices, and gameplay/grid-lighting
  calculations unchanged; an unobstructed other source may still illuminate a
  player-shadowed cell.
- Scale every source-driven GPU contribution by the available ambient headroom.
  At ambient `1.0`, that continuous calculation naturally has no visible
  lighting, shadow, falloff, or bleed result.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `palette-grid-lighting`: Add the adjustable player GPU shadow-bleed range
  and define hard-shadow-core behavior for the optional GPU presentation.
- `game-layer-architecture`: Extend the narrow React-to-game command boundary
  for the persisted player GPU shadow-bleed range.

## Impact

- Affects React Settings storage and controls, the game bridge, and Babylon
  Lite's optional GPU light-pass mask/composite path.
- Adds focused lighting, bridge, and UI tests; no dependencies, world-data
  changes, or simulation changes.
