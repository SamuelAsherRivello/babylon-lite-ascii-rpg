# world-generation-passes Specification

## Purpose
Provides an ordered, deterministic pass pipeline for composing future world
generation features without coupling each feature to the others.

## Requirements

### Requirement: Ordered world-generation passes

The world generator SHALL compose terrain through distinct passes in this order: ground, cave/walls, water, walkability, player position, object-spawner distribution, Underground civilization distribution, and Underground enemy-spawner distribution. A later pass SHALL be able to inspect prior layers and claim or derive only its own layered result. Civilization and enemy-spawner distribution SHALL run only for Underground and SHALL not rewrite natural terrain.

#### Scenario: Enemy-spawner distribution is last for Underground
- **WHEN** an Underground world is generated
- **THEN** enemy spawners SHALL be distributed only after player position, objects, walkability, and civilization occupancy are available

#### Scenario: Civilization distribution is last for Underground
- **WHEN** an Underground world is generated
- **THEN** civilization barriers, doors, and keys SHALL be distributed only after player position, walkability, and existing object prerequisites are available

#### Scenario: Object distribution is last
- **WHEN** a world is generated
- **THEN** all level-spawned objects SHALL be distributed only after player position, walkability, and realm pairing prerequisites are available

#### Scenario: No civilization distribution for Overground
- **WHEN** an Overground world is generated
- **THEN** the civilization pass SHALL add no fences, doors, or keys

#### Scenario: Civilization pass does not rewrite terrain
- **WHEN** the civilization pass places a barrier
- **THEN** it SHALL claim its own civilization/object-layer cells and preserve the underlying natural terrain data

#### Scenario: Object pass does not rewrite terrain
- **WHEN** the Object Spawner System places an object
- **THEN** it SHALL claim a valid object/character-layer position without rewriting terrain kind or walkability

#### Scenario: Passes execute in dependency order
- **WHEN** an Underground world is generated
- **THEN** ground SHALL exist before cave/walls, cave/walls before water, water before walkability, walkability before player placement, player placement before objects, objects before civilization, and civilization before enemy spawners

#### Scenario: Future layer can be added without reordering existing layers
- **WHEN** a later world-generation feature is introduced
- **THEN** it SHALL be representable as a pass with an explicit insertion point and SHALL NOT require unrelated passes to own or rewrite their data

### Requirement: Pass-scoped generation parameters

Each generation pass SHALL receive explicit parameters controlling the amount
or behavior of the layer it owns. A pass SHALL apply its configured values
instead of deriving coverage from viewport dimensions or unrelated defaults.

#### Scenario: Water coverage uses its own parameter

- **WHEN** a caller supplies a water coverage parameter
- **THEN** the water pass SHALL use that parameter independently of cave wall
  fill and smoothing parameters

### Requirement: Deterministic shared generation context

All passes SHALL use the world generation's resolved seed and shared context so
that identical dimensions and parameters reproduce identical layers and player
placement.

#### Scenario: Seeded pass pipeline is repeatable

- **WHEN** the generator runs twice with identical dimensions, parameters, and
  seed
- **THEN** every generated layer and the selected player position SHALL match

### Requirement: Paired-realm static feature pass
The generation pipeline SHALL perform paired-stair placement after both realm
terrain and walkability results are available. The pass SHALL select only
coordinates valid in both realms and SHALL not rewrite terrain or walkability
to force an invalid coordinate to become a stair.

#### Scenario: Invalid shared coordinate is rejected
- **WHEN** a candidate stair coordinate is blocked or unreachable in either
  realm
- **THEN** it is not accepted as a paired stair coordinate
