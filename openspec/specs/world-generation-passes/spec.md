# world-generation-passes Specification

## Purpose
Provides an ordered, deterministic pass pipeline for composing future world
generation features without coupling each feature to the others.

## Requirements

### Requirement: Ordered world-generation passes
The world generator SHALL resolve World Settings before composing terrain. World Settings SHALL resolve the selected identical dimensions for the fixed two realms and SHALL complete before Ground. The generator SHALL then compose terrain through distinct passes in this order: ground, cave/walls, water, walkability, player position, object-spawner distribution, Underground civilization distribution, and Underground enemy-spawner distribution. Ground, Walkability, and Player Position SHALL always execute. Each other pass SHALL execute only when its own enabled setting is true and SHALL otherwise contribute no result, without preventing another enabled optional pass from executing. A later executing pass SHALL be able to inspect prior available layers and claim or derive only its own layered result. Civilization and enemy-spawner distribution SHALL run only for Underground and SHALL not rewrite natural terrain.

#### Scenario: World Settings precedes Ground
- **WHEN** a world is generated with any confirmed World Size
- **THEN** both realm dimensions are resolved before Ground creates either realm's terrain

#### Scenario: Enemy-spawner distribution is last for Underground
- **WHEN** an Underground world is generated with Enemy Spawner Distribution enabled
- **THEN** enemy spawners SHALL be distributed only after player position, objects, walkability, and any enabled civilization occupancy are available

#### Scenario: Civilization distribution is last for Underground
- **WHEN** an Underground world is generated with Doors enabled
- **THEN** civilization barriers, doors, and keys SHALL be distributed only after player position, walkability, and existing enabled object prerequisites are available

#### Scenario: Object distribution is last
- **WHEN** a world is generated with an ambient object pass enabled
- **THEN** that level-spawned object type SHALL be distributed only after player position, walkability, and realm pairing prerequisites are available

#### Scenario: No civilization distribution for Overground
- **WHEN** an Overground realm completes generation
- **THEN** the civilization pass SHALL add no fences, doors, or keys

#### Scenario: Civilization pass does not rewrite terrain
- **WHEN** the civilization pass places a barrier
- **THEN** it SHALL claim its own civilization/object-layer cells and preserve the underlying natural terrain data

#### Scenario: Object pass does not rewrite terrain
- **WHEN** the Object Spawner System places an object
- **THEN** it SHALL claim a valid object/character-layer position without rewriting terrain kind or walkability

#### Scenario: Passes execute in dependency order
- **WHEN** an Underground world is generated
- **THEN** World Settings SHALL resolve before ground, ground SHALL exist before cave/walls, cave/walls before water, water before walkability, walkability before player placement, player placement before objects, objects before civilization, and civilization before enemy spawners whenever those optional passes are enabled

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
