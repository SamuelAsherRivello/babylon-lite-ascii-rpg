# Spec Delta

## MODIFIED Requirements

### Requirement: Final level-spawn distribution pass
The Object Spawner System SHALL run after player placement and SHALL distribute each catalog entry with `IsLevelSpawned: true` only when its corresponding generation pass is enabled, using its JSON distribution rules. Disabled ambient object passes SHALL create no objects of that type. Underground civilization distribution SHALL then select eligible screen regions with a seeded approximately 10% chance and place solvable fence, door, and key groups only when its enabled sublayer runs, without replacing terrain or player state.

#### Scenario: Underground civilization is distributed
- **WHEN** an Underground realm finishes player placement and enabled existing object distribution
- **THEN** eligible enabled civilization groups SHALL be considered before the realm is published as playable

#### Scenario: Level-spawned objects are distributed
- **WHEN** a realm finishes player placement with a level-spawned object pass enabled
- **THEN** that object type SHALL be distributed before the realm is published as playable

#### Scenario: Disabled object distribution is absent
- **WHEN** a realm is generated with Heart Distribution disabled
- **THEN** no ambient Heart objects SHALL be created while other enabled object passes remain eligible to run

#### Scenario: Overground has no civilization group
- **WHEN** an Overground realm completes its final level-spawn pass
- **THEN** no fence, door, or key group SHALL be created

#### Scenario: Seeded distribution is repeatable
- **WHEN** the same realm seed, dimensions, catalog, and generation inputs are used twice
- **THEN** enabled object types, civilization states, and positions SHALL match exactly
