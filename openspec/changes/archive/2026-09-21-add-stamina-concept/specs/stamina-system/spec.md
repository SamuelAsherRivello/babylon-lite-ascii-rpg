# Spec Delta

## Purpose

Defines a bounded player stamina resource for enemy attacks, with
movement-driven HUD-time regeneration and an observable exhausted state.

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

### Requirement: Movement does not consume stamina

The game SHALL NOT subtract stamina for walking or sprinting. A successful
movement SHALL affect stamina only through its movement T-tick recovery. A
blocked or unsuccessful movement SHALL not consume or recover stamina.

#### Scenario: Walking is free

- **WHEN** the player successfully walks
- **THEN** no stamina cost SHALL be applied

#### Scenario: Sprinting is free

- **WHEN** the player successfully sprints
- **THEN** no stamina cost SHALL be applied

#### Scenario: Blocked movement has no stamina effect

- **WHEN** the player attempts to move into a wall, outside the world, or any
  other non-walkable destination
- **THEN** current stamina SHALL remain unchanged

### Requirement: Resolved enemy attacks consume stamina

The game SHALL subtract exactly `25` stamina when a player attack resolves
against an enemy target. Stale targets and non-combat collisions SHALL not
consume stamina. An attack SHALL remain allowed below `25` stamina and the
result SHALL clamp to `0`.

#### Scenario: Enemy attack cost

- **WHEN** the player resolves an attack against an enemy target with `50`
  stamina
- **THEN** current stamina SHALL become `25`

#### Scenario: Stale target has no cost

- **WHEN** no live enemy target is resolved
- **THEN** stamina SHALL remain unchanged

#### Scenario: Low-stamina attack remains allowed

- **WHEN** the player resolves an enemy attack with less than `25` stamina
- **THEN** the attack SHALL still resolve and current stamina SHALL clamp to `0`

### Requirement: Movement T ticks regenerate stamina

The game SHALL restore exactly `10` stamina whenever the HUD's displayed
`Time:` value increases by one. Every successful movement SHALL advance Time by
one. Recovery SHALL be capped at `50`; non-movement ticks SHALL not recover
stamina.

#### Scenario: T tick recovery

- **WHEN** a successful walking movement begins with `30` stamina
- **THEN** the T tick SHALL increase HUD Time by one and regeneration SHALL
  leave current stamina at `40`

#### Scenario: Sprint movement recovers without cost

- **WHEN** a successful sprint movement begins with `30` stamina
- **THEN** the T tick SHALL increase HUD Time by one and regeneration SHALL
  leave current stamina at `40`

### Requirement: Zero stamina remains playable with exhaustion cadence

The game SHALL allow valid walking and sprint movement at `0` stamina. An
attempt that begins at `0` SHALL remain immediate, then use three times the
active later-repeat interval: `375` milliseconds for walking or `100`
milliseconds for sprinting. At stamina `1` or above, movement SHALL use the
normal walking or sprint cadence.

#### Scenario: Exhausted movement remains allowed

- **WHEN** the player at `0` stamina attempts a valid movement
- **THEN** the movement SHALL complete without a movement cost and its T tick
  SHALL recover stamina to `10`

#### Scenario: Exhausted repeat cadence

- **WHEN** a walking or sprint attempt begins at `0` stamina while its movement
  input remains held
- **THEN** the next repeat SHALL be scheduled after `375` milliseconds for
  walking or `100` milliseconds for sprinting

### Requirement: Stamina is exposed as an immutable UI snapshot

The game layer SHALL publish current and maximum stamina plus immutable
previous-value/revision transition metadata needed by the React HUD through the
existing narrow bridge. React SHALL render the meter from that snapshot and
SHALL NOT mutate or calculate authoritative stamina.

#### Scenario: HUD receives stamina update

- **WHEN** movement or a T tick changes current stamina
- **THEN** the bridge SHALL publish the updated current/max snapshot and the HUD
  SHALL update its meter
