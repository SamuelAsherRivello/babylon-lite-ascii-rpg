# world-generation-passes Specification

## Purpose
Provides an ordered, deterministic pass pipeline for composing future world
generation features without coupling each feature to the others.

## Requirements

### Requirement: Ordered world-generation passes
The world generator SHALL compose terrain through distinct passes in this order: ground, cave/walls, water, walkability, player position, object-spawner distribution, Overworld Building distribution, Underground civilization distribution, and Underground enemy-spawner distribution. A later pass SHALL be able to inspect prior layers and claim or derive only its own layered result. Overworld Buildings, Underground civilization, and enemy-spawner distribution SHALL preserve natural terrain identity and SHALL execute only in their declared realms.

#### Scenario: World Settings precedes Ground
- **WHEN** a world is generated with any confirmed World Size
- **THEN** both realm dimensions are resolved before Ground creates either realm's terrain

#### Scenario: Enemy-spawner distribution is last for Underground
- **WHEN** an Underground world is generated
- **THEN** enemy spawners SHALL be distributed only after player position, objects, and Underground civilization occupancy are available

#### Scenario: Civilization distribution is last for Underground
- **WHEN** an Underground world is generated
- **THEN** civilization barriers, doors, and keys SHALL be distributed only after player position, walkability, and existing object prerequisites are available

#### Scenario: Building distribution follows prerequisite static occupancy
- **WHEN** an Overworld world is generated
- **THEN** Buildings SHALL be distributed only after player position, paired stairs, and existing static-object reservations are available

#### Scenario: NPC-spawner distribution is last for Overground
- **WHEN** an Overground world is generated
- **THEN** NPC spawners SHALL be distributed only after player position, objects, and walkability are available

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
When the Stairs generation pass is enabled, the generation pipeline SHALL perform paired-stair placement after both realm terrain and walkability results are available. The pass SHALL select only coordinates valid in both realms and SHALL not rewrite terrain or walkability to force an invalid coordinate to become a stair. When Stairs is disabled, it SHALL create no paired stairs and both realms SHALL remain playable without realm travel.

#### Scenario: Invalid shared coordinate is rejected
- **WHEN** Stairs is enabled and a candidate stair coordinate is blocked or unreachable in either realm
- **THEN** it is not accepted as a paired stair coordinate

#### Scenario: Disabled paired stairs
- **WHEN** both realms are generated with Stairs disabled
- **THEN** neither realm contains generated stairs and ordinary movement remains available

### Requirement: Density profiles preserve pass ownership and order
The generation pipeline SHALL resolve each selected pass density into parameters owned by that pass without reordering the existing pipeline or allowing a pass to rewrite another pass's layer.

#### Scenario: Apply selected cave and water profiles
- **WHEN** a world is generated with non-Med Cave / Walls and Water selections
- **THEN** cave wall fill and water distribution use their selected profiles independently and retain the existing pass order

### Requirement: Empty diagnostic layers perform no placement work
An optional disabled feature or a feature with a resolved count of zero SHALL produce no placement, reservations, feature-specific candidate search, shuffle, or simulation preparation. Shared required terrain and placement prerequisites SHALL remain available to other enabled features. Production effective enablement SHALL follow the production settings policy.

#### Scenario: All optional diagnostic layers disabled
- **WHEN** an isolated development run disables every optional layer
- **THEN** only the required baseline and its necessary shared work execute, with no torches, objects, civilization, stairs, or dynamic spawners contributed by disabled features

#### Scenario: Zero-count torch or object pass
- **WHEN** a torch or object distribution request has a resolved count of zero
- **THEN** it returns an empty placement without searching or reserving candidates

### Requirement: Optimized generation retains layer results
For identical resolved inputs and positive enabled counts, optimized generation SHALL preserve established terrain, depth, walkability, player position, object placement, paired stairs, civilization, building, and spawner results. Shared or retained generation data SHALL respect realm identity, generation parameters, and current placement reservations. Changing execution scheduling SHALL NOT change generated results.

#### Scenario: Optimized output matches its reference
- **WHEN** a fixed fixture is generated by the reference and optimized positive-count paths with matching inputs
- **THEN** all owned layer outputs and placement relationships match, including seeded ordering and keys associated with doors or homes

#### Scenario: Prior placement changes invalidate derived candidates
- **WHEN** a placement or terrain revision changes reservations or effective walkability
- **THEN** later layers use candidates consistent with the new state and do not reuse stale occupancy
