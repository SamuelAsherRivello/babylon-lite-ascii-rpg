# combat-stats Specification

## Purpose
Defines the player's stamina-derived combat readiness and the deterministic
damage calculations that make Offense and Defense meaningful during combat.

## Requirements

### Requirement: Combat stats have permanent maximums and stamina-derived current values

The game SHALL initialize player stamina at `50` current out of `50` maximum
and SHALL maintain separate maximum and current values for player Offense and
Defense. The initial maximum for each stat SHALL be `25`. The current value
SHALL be derived from the current stamina ratio using a linear
factor of `1`, clamped to the inclusive range from `0` through its maximum.
The game SHALL NOT change the existing stamina maximum, stamina cost, stamina
recovery, health maximum, or health recovery rules as part of this capability.

#### Scenario: Full stamina provides full combat readiness
- **WHEN** the player has current stamina equal to maximum stamina
- **THEN** current Offense and Defense SHALL equal their respective maximums

#### Scenario: Reduced stamina reduces both combat stats
- **WHEN** the player has 25% of maximum stamina
- **THEN** current Offense and Defense SHALL each be 25% of their respective maximums

#### Scenario: Combat readiness recovers with stamina
- **WHEN** movement-driven time recovery increases the player's stamina
- **THEN** current Offense and Defense SHALL increase to the corresponding stamina-derived values without changing their maximums

### Requirement: Player attacks scale maximum damage by current Offense

When a valid player attack resolves against an enemy or enemy spawner, the
applied damage SHALL be calculated from the target's configured maximum player
damage and the player's current Offense ratio. The result SHALL be rounded to
the nearest whole number and clamped to at least `1`. At full current Offense,
the attack SHALL apply the configured maximum player damage.

#### Scenario: Full Offense deals maximum damage
- **WHEN** the player attacks with current Offense equal to maximum Offense
- **THEN** the target SHALL receive the configured maximum player damage

#### Scenario: Reduced Offense deals proportionally reduced damage
- **WHEN** the player attacks with current Offense equal to 50% of maximum Offense
- **THEN** the target SHALL receive 50% of configured maximum player damage after rounding

#### Scenario: Exhausted player can still deal minimum damage
- **WHEN** the player attacks with zero current Offense
- **THEN** the valid attack SHALL apply exactly `1` damage rather than zero damage

#### Scenario: Spawner attacks use the same player scaling
- **WHEN** the player attacks an enemy spawner
- **THEN** the spawner SHALL receive damage calculated by the same current-Offense rule as an enemy

### Requirement: Player Defense reduces incoming enemy damage

When an enemy attack resolves against the player, the applied damage SHALL
begin with the enemy's configured maximum attack damage and subtract a
Defense-derived mitigation contribution. The mitigation SHALL scale linearly
with the player's current Defense ratio and SHALL be capped at 50% of incoming
damage. Applied damage SHALL be rounded up and clamped to at least `1`.

#### Scenario: Full Defense provides bounded mitigation
- **WHEN** the player is attacked with current Defense equal to maximum Defense
- **THEN** applied damage SHALL be 50% of the enemy's maximum attack damage, rounded up, and never less than `1`

#### Scenario: Reduced Defense provides reduced mitigation
- **WHEN** the player is attacked with current Defense equal to 50% of maximum Defense
- **THEN** applied damage SHALL be reduced by 25% of the enemy's maximum attack damage, rounded up

#### Scenario: Zero Defense receives maximum damage
- **WHEN** the player is attacked with zero current Defense
- **THEN** applied damage SHALL equal the enemy's configured maximum attack damage

### Requirement: Combat stat snapshots are immutable and authoritative

The game layer SHALL publish immutable Offense and Defense snapshots containing
current values, maximum values, and normalized current percentages whenever
stamina changes or the combat-stat maximums change. React SHALL consume these
snapshots for presentation and SHALL NOT calculate combat values or mutate
gameplay state.

#### Scenario: Attack publishes reduced combat readiness
- **WHEN** a valid player attack spends stamina
- **THEN** the next Offense and Defense snapshots SHALL expose the reduced current values and percentages

#### Scenario: Recovery publishes restored combat readiness
- **WHEN** a movement-driven recovery restores stamina
- **THEN** the next Offense and Defense snapshots SHALL expose the restored current values and percentages

### Requirement: Mountain digging uses player Offense scaling

Damage dealt while digging an interior Overground mountain SHALL use the same
maximum player attack damage and current-Offense ratio as a player attack
against an enemy. Damage SHALL be rounded to the nearest whole number and
clamped to at least `1`.

#### Scenario: Full Offense damages a mountain
- **WHEN** the player digs with current Offense equal to maximum Offense
- **THEN** the mountain SHALL receive the configured maximum player attack
  damage

#### Scenario: Reduced Offense damages a mountain
- **WHEN** the player digs with current Offense equal to `50%` of maximum
  Offense
- **THEN** the mountain SHALL receive `50%` of configured maximum damage after
  rounding

#### Scenario: Zero Offense still damages a mountain
- **WHEN** the player digs with zero current Offense
- **THEN** the mountain SHALL receive exactly `1` damage
