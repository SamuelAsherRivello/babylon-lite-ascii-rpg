# Spec Delta

## ADDED Requirements

### Requirement: Level-spawned objects use the declared catalog
The Object Spawner System SHALL create level-spawned objects only from declared catalog definitions, preserve each definition's interaction and reward metadata, and support house-owned chest objects without introducing a separate chest type or interaction path.

#### Scenario: Declared house chest is created
- **WHEN** the Overworld building pass declares a valid house chest placement
- **THEN** the Object Spawner System creates a catalog-defined `chest` object at that cell and records its owning house when ownership is provided

#### Scenario: Unknown house chest type is rejected
- **WHEN** a house placement requests an object type absent from the catalog
- **THEN** object creation fails using the existing unknown-object validation and does not create a partial object

#### Scenario: House chest preserves catalog behavior
- **WHEN** a house-owned chest is added
- **THEN** its glyphs, open state, reward metadata, realm, and active state follow the same catalog-defined contract as any other chest
