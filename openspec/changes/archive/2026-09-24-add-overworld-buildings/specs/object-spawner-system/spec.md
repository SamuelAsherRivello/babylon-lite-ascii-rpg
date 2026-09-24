# Spec Delta

## MODIFIED Requirements

### Requirement: Final level-spawn distribution pass
The Object Spawner System SHALL run after player placement and SHALL distribute every catalog entry with `IsLevelSpawned: true` using its JSON distribution rules. Underground civilization distribution SHALL then select eligible screen regions with a seeded approximately 10% chance and place solvable fence, door, and key groups without replacing terrain or player state. The Overworld Building pass SHALL reuse the existing Door and Key object behaviors for every accepted Building while retaining Building-owned footprint and visibility state.

#### Scenario: Underground civilization is distributed
- **WHEN** an Underground realm finishes player placement and existing object distribution
- **THEN** eligible civilization groups SHALL be considered before the realm is published as playable

#### Scenario: Overworld Building is distributed
- **WHEN** an Overworld realm finishes player placement, paired-stair placement, and existing object distribution
- **THEN** eligible Building groups SHALL be considered before the realm is published as playable

#### Scenario: Level-spawned objects are distributed
- **WHEN** a realm finishes player placement
- **THEN** Hearts, Torches, Traps, and paired Stairs SHALL be distributed before the realm is published as playable

#### Scenario: Disabled object distribution is absent
- **WHEN** a realm is generated with Heart Distribution disabled
- **THEN** no ambient Heart objects SHALL be created while other enabled object passes remain eligible to run

#### Scenario: Realm-scoped static groups
- **WHEN** an Overworld realm completes its final level-spawn pass
- **THEN** it SHALL create no Underground fence-line civilization group but MAY create configured Buildings with their associated existing Doors and Keys

#### Scenario: Overground has no civilization group
- **WHEN** an Overground realm completes its final level-spawn pass
- **THEN** it SHALL create no Underground fence-line civilization group but MAY create configured Buildings with their associated existing Doors and Keys

#### Scenario: Seeded distribution is repeatable
- **WHEN** the same realm seed, dimensions, catalog, and generation inputs are used twice
- **THEN** object types, civilization states, Building states, and positions SHALL match exactly
