# Spec Delta

## Purpose

Defines a bounded player stamina resource for walking and sprinting, with
independent HUD-time regeneration and an observable exhausted movement state.

## ADDED Requirements

### Requirement: Player stamina has bounded initial state

The game SHALL initialize each new player with `50` current stamina and a
maximum stamina of `50`. Current stamina SHALL remain within the inclusive
range `0` through `50` and SHALL never exceed maximum stamina.

#### Scenario: New game stamina

- **WHEN** a new game session starts
- **THEN** the player's stamina snapshot SHALL report `50` current stamina out
  of `50` maximum stamina

#### Scenario: Regeneration is capped

- **WHEN** a T tick would restore stamina above `50`
- **THEN** current stamina SHALL remain exactly `50`

### Requirement: Movement consumes stamina by movement mode

The game SHALL subtract exactly `1` stamina for each successful walking
movement step and exactly `2` stamina for each successful sprint movement
step. A blocked or unsuccessful movement SHALL not consume stamina.

#### Scenario: Walking cost

- **WHEN** the player successfully walks with `50` stamina
- **THEN** current stamina SHALL become `49` unless a same-boundary T tick is
  also processed

#### Scenario: Sprint cost

- **WHEN** the player successfully sprints with `50` stamina
- **THEN** current stamina SHALL become `48` unless a same-boundary T tick is
  also processed

#### Scenario: Blocked movement has no stamina effect

- **WHEN** the player attempts to move into a wall, outside the world, or any
  other non-walkable destination
- **THEN** current stamina SHALL remain unchanged

### Requirement: T ticks regenerate stamina independently

The game SHALL restore exactly `10` stamina whenever the HUD's displayed
`Time:` value increases by one. T-tick recovery SHALL be a separate event from
movement cost; if both occur at the same boundary, movement cost SHALL be
applied first and regeneration second. Recovery SHALL be capped at `50`.

#### Scenario: T tick recovery

- **WHEN** the HUD Time value increases by one while current stamina is `30`
- **THEN** current stamina SHALL become `40`

#### Scenario: Movement without a T tick

- **WHEN** the player successfully walks without a simultaneous T tick
- **THEN** current stamina SHALL decrease by exactly `1`

### Requirement: Zero stamina remains playable with exhaustion cadence

The game SHALL allow valid walking and sprint movement at `0` stamina. While
stamina is `0`, the second and subsequent movement attempts SHALL use a fixed
`0.375` second repeat interval after the initial immediate attempt. At stamina
`1` or above, movement SHALL use the normal or sprint cadence.

#### Scenario: Exhausted movement remains allowed

- **WHEN** the player at `0` stamina attempts a valid movement
- **THEN** the movement SHALL complete and stamina SHALL remain bounded at `0`
  unless a T tick is processed

#### Scenario: Exhausted repeat cadence

- **WHEN** the player remains at `0` stamina while holding a movement input
- **THEN** the first attempt SHALL be immediate and each later attempt SHALL be
  separated by `0.375` seconds

### Requirement: Stamina is exposed as an immutable UI snapshot

The game layer SHALL publish only current and maximum stamina values needed by
the React HUD through the existing narrow bridge. React SHALL render the meter
from that snapshot and SHALL NOT mutate or calculate authoritative stamina.

#### Scenario: HUD receives stamina update

- **WHEN** movement or a T tick changes current stamina
- **THEN** the bridge SHALL publish the updated current/max snapshot and the HUD
  SHALL update its meter
