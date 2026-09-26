# Spec Delta

## ADDED Requirements

### Requirement: Chest opening produces an observable complete lifecycle

The Object Spawner System SHALL block movement into a closed Treasure Chest. When a player attempts a cardinal move into that cell, the chest SHALL change immediately to its open glyph, remain rendered, and become spent. A spent chest SHALL remain blocking and SHALL not create another reward on later cardinal bump attempts.

#### Scenario: First cardinal contact opens a chest
- **WHEN** the player makes one cardinal movement input toward an unopened chest
- **THEN** the chest opens during that input and no second movement input is required

#### Scenario: Repeated contact does not reopen a spent chest
- **WHEN** the player contacts an already opened chest again
- **THEN** the chest remains open and no second reward or opening log is created

### Requirement: Chest opening creates and exposes the guaranteed Heart reward

The Object Spawner System SHALL select a chest reward from a weighted subset of catalog object types and create exactly one instance using the selected object type's normal behavior. The initial Treasure Chest reward table SHALL select Heart with 100 percent probability. On opening, the selected reward SHALL spawn on one randomly selected empty walkable cell among the eight cells surrounding the chest that is not occupied by the player. The spawned Heart SHALL be registered in the active realm's authoritative object and collision collections and SHALL be rendered without requiring a page reload or unrelated world regeneration.

#### Scenario: Opening a chest creates a visible Heart nearby
- **WHEN** an unopened chest is opened and at least one valid neighboring cell exists
- **THEN** exactly one collectible Heart is registered and rendered in one of the chest's eight neighboring cells

#### Scenario: A blocked neighborhood does not create an invalid Heart
- **WHEN** an unopened chest is opened and every neighboring cell is invalid or occupied
- **THEN** the chest still opens, no Heart is placed in an invalid cell, and the result remains observable through the opening log

### Requirement: House-owned chests use the same observable chest lifecycle

The Object Spawner System SHALL create level-spawned objects only from declared catalog definitions, preserve each definition's interaction and reward metadata, and support house-owned chest objects without introducing a separate chest type or interaction path.

#### Scenario: House chest uses the guaranteed reward lifecycle
- **WHEN** the player opens a house-owned chest
- **THEN** it uses the same opening, Heart registration, rendering, collection, and logging behavior as a standalone chest
