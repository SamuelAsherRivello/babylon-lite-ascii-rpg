# Spec Delta

## MODIFIED Requirements

### Requirement: JSON-defined object catalog
The Object Spawner System SHALL load a JSON object catalog whose entries define
an object glyph, name, `IsPickup`, `IsLevelSpawned`, consequence parameters,
optional log text, and distribution rules. Key entries SHALL be one-time
pickups. Fence and door entries SHALL identify their closed/open glyphs and
stateful collision behavior. Fireplace entries SHALL identify the persistent
`🔥` checkpoint object. Every catalog glyph SHALL exist in the active palette
with an editable color.

#### Scenario: Civilization catalog entry has palette identity
- **WHEN** a key, fence, or door catalog entry loads
- **THEN** every state glyph SHALL resolve to a palette entry before rendering

#### Scenario: Fireplace catalog entry has palette identity
- **WHEN** the Fireplace catalog entry loads
- **THEN** its `🔥` glyph SHALL resolve to a palette entry with a configured color before it can be rendered

#### Scenario: Catalog entry has palette identity
- **WHEN** the object catalog loads an object entry
- **THEN** its glyph SHALL resolve to a palette entry with a configured color
  before the object can be rendered

#### Scenario: Invalid civilization glyph is rejected
- **WHEN** a civilization catalog entry references a glyph absent from the
  palette
- **THEN** catalog loading SHALL fail with an actionable validation error

#### Scenario: Invalid glyph is rejected
- **WHEN** an object catalog entry references a glyph absent from the palette
- **THEN** catalog loading SHALL fail with an actionable validation error

### Requirement: Final level-spawn distribution pass
The Object Spawner System SHALL run after player placement and SHALL distribute every catalog entry with `IsLevelSpawned: true` using its JSON distribution rules. Underground civilization distribution SHALL then select eligible screen regions with a seeded approximately 10% chance and place solvable fence, door, and key groups without replacing terrain or player state. After those groups are created, the system SHALL place persistent Fireplaces using their Low, Med, or High JSON distribution count on separate valid walkable cells.

#### Scenario: Underground civilization is distributed
- **WHEN** an Underground realm finishes player placement and existing object distribution
- **THEN** eligible civilization groups SHALL be considered before the realm is published as playable

#### Scenario: Fireplace distribution follows civilization
- **WHEN** an Underground realm has completed civilization distribution
- **THEN** the Object Spawner System SHALL add the selected Fireplace density count before the realm is published as playable

#### Scenario: Level-spawned objects are distributed
- **WHEN** a realm finishes player placement
- **THEN** Hearts, Torches, Traps, and paired Stairs SHALL be distributed before the realm is published as playable

#### Scenario: Overground has no civilization group
- **WHEN** an Overground realm completes its final level-spawn pass
- **THEN** no fence, door, key, or Fireplace SHALL be created

#### Scenario: Seeded distribution is repeatable
- **WHEN** the same realm seed, dimensions, catalog, and generation inputs are used twice
- **THEN** object types, civilization states, Fireplace positions, and object positions SHALL match exactly
