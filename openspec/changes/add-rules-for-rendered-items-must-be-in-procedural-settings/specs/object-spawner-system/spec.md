# Spec Delta

## MODIFIED Requirements

### Requirement: Final level-spawn distribution pass

The Object Spawner System SHALL run through Object Distribution after player placement and SHALL distribute every catalog entry with `IsLevelSpawned: true` whose declared realm scope and prerequisites are satisfied, using its JSON distribution rules and selected per-object profile. A qualifying entry SHALL participate automatically without a separate hard-coded placement path. Underground civilization distribution SHALL then select eligible screen regions with a seeded approximately 10% chance and place solvable fence, door, and key groups without replacing terrain or player state.

#### Scenario: Underground civilization is distributed
- **WHEN** an Underground realm finishes player placement and Object Distribution
- **THEN** eligible civilization groups SHALL be considered before the realm is published as playable

#### Scenario: Level-spawned objects are distributed
- **WHEN** a realm finishes player placement
- **THEN** every qualifying level-spawned object, including Hearts, Torches, Traps, and paired Stairs, SHALL be distributed before the realm is published as playable

#### Scenario: New level-spawned object is automatic
- **WHEN** a new object catalog entry is valid, has `IsLevelSpawned: true`, and declares its realm scope and distribution rules
- **THEN** Object Distribution SHALL consider it without a feature-specific startup placement call

#### Scenario: Overground has no civilization group
- **WHEN** an Overground realm completes its final level-spawn pass
- **THEN** no fence, door, or key group SHALL be created

#### Scenario: Seeded distribution is repeatable
- **WHEN** the same realm seed, dimensions, catalog, and generation inputs are used twice
- **THEN** object types, civilization states, and positions SHALL match exactly
