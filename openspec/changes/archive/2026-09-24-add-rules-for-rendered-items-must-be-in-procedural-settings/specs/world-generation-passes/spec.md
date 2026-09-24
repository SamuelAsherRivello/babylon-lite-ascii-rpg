# Spec Delta

## MODIFIED Requirements

### Requirement: Ordered world-generation passes

The world generator SHALL compose a realm through the current ordered catalog: ground, Overground walls, Underground caves, water, walkability, player position, Heart distribution, Chest distribution, Trap distribution, Torch distribution, NPC distribution, Fireplace distribution, paired Civilization Placement Stairs distribution, Underground Civilization Placement Doors distribution, and Underground enemy-spawner distribution. The Procedural UI SHALL group Heart, Chest, Trap, Torch, and Fireplace as Object Distribution; Stairs plus Doors as Civilization Placement; and Enemy plus NPC as Character Distribution, without changing raw execution order. Character Distribution SHALL list Enemy before NPC and visibly identify their Underworld and Overworld realms. The Civilization Placement card SHALL not display a realm; its Doors sublayer SHALL identify `Realm: Underground`. A later pass SHALL inspect prior layers and claim or derive only its own layered result. Doors and enemy-spawner distribution SHALL run only for Underground and SHALL not rewrite natural terrain. NPC distribution SHALL run only for Overground. Paired Civilization Placement Stairs SHALL run before Doors and use an independent profile whose initial Low, Med, and High values are one-time copies of the current Heart values; later Heart changes SHALL NOT change Stair distribution. Fireplace distribution SHALL run after Doors because it declares Doors occupancy as a prerequisite.

#### Scenario: Enemy-spawner distribution is last for Underground
- **WHEN** an Underground world is generated
- **THEN** enemy spawners SHALL be distributed only after player position, objects, walkability, and civilization occupancy are available

#### Scenario: Civilization distribution follows the object phase
- **WHEN** an Underground world is generated
- **THEN** civilization barriers, doors, and keys SHALL be distributed only after player position, walkability, and existing object prerequisites are available

#### Scenario: Civilization distribution is last for Underground
- **WHEN** an Underground world is generated
- **THEN** civilization barriers, doors, and keys SHALL be distributed only after player position, walkability, and existing object prerequisites are available, before the later Underground enemy-spawner pass

#### Scenario: Object Distribution includes all qualifying objects
- **WHEN** a realm is generated
- **THEN** every level-generated object whose prerequisites are satisfied SHALL be distributed through Object Distribution after player position, walkability, and realm-pairing prerequisites are available

#### Scenario: Object distribution is last
- **WHEN** a world is generated
- **THEN** each level-spawned object SHALL be considered through Object Distribution only after player position, walkability, realm pairing, and any feature-declared prerequisites are available

#### Scenario: NPC-spawner distribution is Overground-only
- **WHEN** an Overground world is generated
- **THEN** NPC spawners SHALL be distributed at their catalog position, after Torches and before Fireplaces, without adding civilization features

#### Scenario: Only paired Stairs are placed for Overground Civilization Placement
- **WHEN** an Overground world is generated
- **THEN** the Civilization Placement pass SHALL add paired Stairs but no fences, Doors, or keys

#### Scenario: No civilization distribution for Overground
- **WHEN** an Overground world is generated
- **THEN** the Civilization Placement pass SHALL add no fences, Doors, or keys

#### Scenario: Civilization pass does not rewrite terrain
- **WHEN** the civilization pass places a barrier
- **THEN** it SHALL claim its own civilization/object-layer cells and preserve the underlying natural terrain data

#### Scenario: Object pass does not rewrite terrain
- **WHEN** the Object Spawner System places an object
- **THEN** it SHALL claim a valid object/character-layer position without rewriting terrain kind or walkability

#### Scenario: Passes execute in dependency order
- **WHEN** an Underground world is generated
- **THEN** ground SHALL exist before cave/walls, cave/walls before water, water before walkability, walkability before player placement, player placement before Object Distribution, Object Distribution before civilization, and civilization before enemy spawners

#### Scenario: Disabled optional passes retain a playable baseline
- **WHEN** every optional generation pass is disabled
- **THEN** the world SHALL still create ground, a connected walkable region, and a player start so that rendering and player movement can run

#### Scenario: Future layer can be added without reordering existing layers
- **WHEN** a later world-generation feature introduces a new owner layer
- **THEN** it SHALL be representable as a pass with explicit prerequisites and SHALL NOT require unrelated passes to own, rewrite, or change their execution order
