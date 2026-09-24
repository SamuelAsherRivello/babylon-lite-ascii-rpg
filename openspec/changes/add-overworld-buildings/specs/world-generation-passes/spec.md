# Spec Delta

## MODIFIED Requirements

### Requirement: Ordered world-generation passes
The world generator SHALL compose terrain through distinct passes in this order: ground, cave/walls, water, walkability, player position, object-spawner distribution, Overworld Building distribution, Underground civilization distribution, and Underground enemy-spawner distribution. A later pass SHALL be able to inspect prior layers and claim or derive only its own layered result. Overworld Buildings, Underground civilization, and enemy-spawner distribution SHALL preserve natural terrain identity and SHALL execute only in their declared realms.

#### Scenario: Enemy-spawner distribution is last for Underground
- **WHEN** an Underground world is generated
- **THEN** enemy spawners SHALL be distributed only after player position, objects, and Underground civilization occupancy are available

#### Scenario: Civilization distribution is last for Underground
- **WHEN** an Underground world is generated
- **THEN** civilization barriers, doors, and keys SHALL be distributed only after player position, walkability, and existing object prerequisites are available

#### Scenario: Building distribution follows prerequisite static occupancy
- **WHEN** an Overworld world is generated
- **THEN** Buildings SHALL be distributed only after player position, paired stairs, and existing static-object reservations are available

#### Scenario: Object distribution is last
- **WHEN** a world is generated
- **THEN** all level-spawned objects SHALL be distributed only after player position and realm pairing prerequisites are available

#### Scenario: Overworld Building distribution is realm-scoped
- **WHEN** an Overworld world is generated
- **THEN** it SHALL receive only configured Overworld Buildings and no Underground fence-line civilization group

#### Scenario: No civilization distribution for Overground
- **WHEN** an Overground world is generated
- **THEN** it SHALL receive no Underground fence-line civilization group but MAY receive configured Overworld Buildings

#### Scenario: Underground civilization distribution is realm-scoped
- **WHEN** an Underground world is generated
- **THEN** it SHALL receive only configured Underground civilization groups and no Overworld Building

#### Scenario: Civilization pass does not rewrite terrain
- **WHEN** a civilization group or Building is placed
- **THEN** it SHALL claim its own static overlay cells and preserve the underlying natural terrain data

#### Scenario: Object pass does not rewrite terrain
- **WHEN** the Object Spawner System places an object
- **THEN** it SHALL claim a valid object/character-layer position without rewriting terrain kind or walkability

#### Scenario: Passes execute in dependency order
- **WHEN** an Underground world is generated
- **THEN** ground SHALL exist before cave/walls, cave/walls before water, water before walkability, walkability before player placement, player placement before objects, objects before civilization, and civilization before enemy spawners

#### Scenario: Disabled optional passes retain a playable baseline
- **WHEN** every optional generation pass is disabled
- **THEN** the world SHALL still create ground, a connected walkable region, and a player start so that rendering and player movement can run

#### Scenario: Future layer can be added without reordering existing layers
- **WHEN** a later world-generation feature is introduced
- **THEN** it SHALL be representable as a pass with an explicit insertion point and SHALL NOT require unrelated passes to own or rewrite their data
