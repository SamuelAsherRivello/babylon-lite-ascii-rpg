# Spec Delta

## ADDED Requirements

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
