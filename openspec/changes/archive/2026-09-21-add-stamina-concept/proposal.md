# Proposal

## Why

The game has no visible resource connecting its movement-driven recovery loop
to combat exertion. Adding authoritative stamina now gives enemy attacks a
tunable cost while preserving the existing grid movement, HUD, and game-layer
ownership boundaries.

## What Changes

- Add an authoritative stamina resource with a maximum of `50` and an initial
  current value of `50`; current stamina SHALL never exceed that maximum.
- Add a stamina meter immediately below Health, followed by the existing
  Offense, Defense, and Experience bars.
- Give every Character bar three shades derived from its configured target
  color: solid current fill, a temporary delta fill, and a dark unfilled fill.
  Render bars from normalized `0`-to-`100` percentages supplied by the owning
  gameplay model; bars SHALL NOT infer percentages from nominal values because
  each resource may use a different numeric scale. Stamina therefore starts as
  `50%` solid orange plus `50%` dark orange even though its nominal gameplay
  current/maximum are `50/50`. Do not add numeric text inside or beside the
  stamina bar; expose its nominal current/max through accessibility values.
- Walking and sprinting SHALL NOT consume stamina. Preserve the existing Shift
  sprint cadence of `100/3` milliseconds between later repeated moves.
- Advance HUD `Time:` by one movement T tick for every successful movement and
  regenerate `10` stamina on that tick, capped at `50`.
- Deduct `25` stamina whenever a player attack successfully resolves against an
  enemy target. Attacks remain allowed below `25`, with stamina clamped at `0`.
- Keep movement available at zero stamina. Multiply the active later-repeat
  interval by `3` while exhausted: `375` milliseconds for walking and `100`
  milliseconds for sprinting. The first movement remains immediate.
- Publish current/max stamina plus immutable previous-value/revision transition
  metadata through the existing narrow game-to-React snapshot path so React
  renders movement deltas without owning gameplay state.
- Reduce the existing Character resource/slot boxes from `28px` to a hardcoded
  `22.4px` size to make room for the fifth bar.
- Do not add an insufficient-stamina attack lockout, attack/defense stat
  penalties, or other zero-stamina combat penalties in this change.

## Capabilities

### New Capabilities

- `stamina-system`: Defines bounded stamina state, enemy-attack cost,
  movement-driven T-tick regeneration, zero-stamina movement, and HUD snapshots.

### Modified Capabilities

- `player-grid-movement`: Successful walking and sprint movement do not consume
  stamina, movement T ticks recover stamina, and exhausted movement uses a
  slower cadence.
- `game-layer-architecture`: The game layer owns stamina and sprint state while
  React receives only immutable stamina values for HUD presentation.
- `responsive-ui-layout`: The Character box gains a fifth bar below Health and
  uses smaller resource/slot boxes to preserve responsive space.

## Impact

- Babylon Lite needs a dedicated stamina system, combat-cost integration,
  sprint-aware/exhausted movement timing, and movement-driven T-tick recovery
  under the existing client/test layout.
- The bridge snapshot and React Character box gain current/max stamina values;
  React remains presentation-only.
- Existing movement, Time System, bridge, HUD, responsive, Node-test, build,
  and browser checks need focused updates; no new dependency is expected.
