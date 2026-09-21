# Proposal

## Why

The first playable movement loop has no visible resource cost or distinction
between ordinary movement and sprinting. Adding an authoritative stamina loop
now gives movement a tunable pacing resource while preserving the existing
grid movement, HUD, and game-layer ownership boundaries.

## What Changes

- Add an authoritative stamina resource with a maximum of `50` and an initial
  current value of `50`; current stamina SHALL never exceed that maximum.
- Add a stamina meter immediately below Health, followed by the existing
  Offense, Defense, and Experience bars.
- Use the existing three-color bar treatment: current fill, transition/delta
  fill, and unfilled background. Do not add numeric text inside or beside the
  stamina bar; expose current/max through progress-bar accessibility values.
- Deduct `1` stamina for each successful walking movement step.
- Add Shift sprinting with a faster movement cadence than walking and deduct
  `2` stamina for each successful sprint movement step.
- Regenerate `10` stamina on each independent T tick, where a T tick is one
  increase of the HUD's displayed `Time:` value. Regeneration SHALL be capped
  at `50`.
- Keep movement cost and T-tick regeneration as separate events. If one event
  causes both a movement cost and a T tick, apply the cost first and then the
  regeneration.
- Keep movement available at zero stamina, but use a fixed `0.375` second
  repeat interval for exhausted movement after the initial immediate attempt.
- Publish current/max stamina through the existing narrow game-to-React
  snapshot path so React renders the meter without owning gameplay state.
- Reduce the existing Character resource/slot boxes from `28px` to a hardcoded
  `22.4px` size to make room for the fifth bar.
- Do not add attack, defense, damage, or other zero-stamina combat penalties in
  this change.

## Capabilities

### New Capabilities

- `stamina-system`: Defines bounded stamina state, walking/sprinting costs,
  independent T-tick regeneration, zero-stamina movement, and HUD snapshots.

### Modified Capabilities

- `player-grid-movement`: Successful walking and sprint movement now consume
  different stamina amounts and exhausted movement uses a slower cadence.
- `game-layer-architecture`: The game layer owns stamina and sprint state while
  React receives only immutable stamina values for HUD presentation.
- `responsive-ui-layout`: The Character box gains a fifth bar below Health and
  uses smaller resource/slot boxes to preserve responsive space.

## Impact

- Babylon Lite needs a dedicated stamina system, sprint-aware movement timing,
  and a T-tick recovery integration under the existing runtime/test layout.
- The bridge snapshot and React Character box gain current/max stamina values;
  React remains presentation-only.
- Existing movement, Time System, bridge, HUD, responsive, Node-test, build,
  and browser checks need focused updates; no new dependency is expected.
- The exact independent T-tick cadence and exact sprint cadence remain open
  tuning decisions. The implementation SHALL preserve the stated ordering and
  relative behavior while keeping those constants easy to adjust.
