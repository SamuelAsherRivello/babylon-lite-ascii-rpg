# Spec Delta

## MODIFIED Requirements

### Requirement: Ordered world-generation passes

The world generator SHALL compose terrain through distinct passes in this order: ground, cave/walls, water, walkability, player position, and object-spawner distribution. A later pass SHALL be able to inspect prior layers and claim or derive only its own layered result.

#### Scenario: Object distribution is last
- **WHEN** a world is generated
- **THEN** all level-spawned objects SHALL be distributed only after player position, walkability, and realm pairing prerequisites are available

#### Scenario: Object pass does not rewrite terrain
- **WHEN** the Object Spawner System places an object
- **THEN** it SHALL claim a valid object/character-layer position without rewriting terrain kind or walkability

#### Scenario: Passes execute in dependency order
- **WHEN** a world is generated
- **THEN** ground exists before cave/walls, cave/walls exist before water, water exists before walkability, and walkability exists before player placement

#### Scenario: Future layer can be added without reordering existing layers
- **WHEN** a later world-generation feature is introduced
- **THEN** it SHALL be representable as a pass with an explicit insertion point and SHALL NOT require unrelated passes to own or rewrite its data
