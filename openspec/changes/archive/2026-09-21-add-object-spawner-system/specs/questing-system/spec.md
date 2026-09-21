# Spec Delta

## MODIFIED Requirements

### Requirement: Generic collectible pickups

The Object Spawner System SHALL represent a pickup as a world object with an identity, a world position, a glyph backed by the active palette, a collectible state, and an effect applied when the player collects it. A collected pickup SHALL be removed from the current world instance and SHALL NOT be collectible again during that instance. Persistent non-pickup objects SHALL be represented by the same object authority but SHALL not be consumed by collision.

#### Scenario: Player collects a pickup
- **WHEN** the player occupies the pickup's world cell
- **THEN** the pickup's effect SHALL be applied once, its configured log SHALL be emitted, and the pickup SHALL no longer be rendered or collectible

#### Scenario: Persistent object is revisited
- **WHEN** the player later returns to a persistent object cell
- **THEN** the object SHALL remain present and its configured collision behavior SHALL apply according to its catalog entry

#### Scenario: Collected pickup is revisited
- **WHEN** the player later returns to a cell whose pickup was collected
- **THEN** the pickup SHALL remain absent and its effect SHALL NOT be applied again

### Requirement: Collect Gold quest

The system SHALL start one Collect Gold quest with a target of three Gold pickups. The quest system SHALL request those pickups from the Object Spawner System rather than placing Gold directly. Each Gold pickup SHALL credit exactly one Gold when collected.

#### Scenario: Gold pickups are generated
- **WHEN** the Collect Gold quest starts
- **THEN** exactly three collectible Gold objects SHALL be requested from and placed by the Object Spawner System at approximately 10, 30, and 100 grid cells from the player start

#### Scenario: Gold advances quest progress
- **WHEN** one generated Gold pickup is collected
- **THEN** character Gold SHALL increase by 1 and quest progress SHALL increase by 1

#### Scenario: All gold completes the quest
- **WHEN** the third generated Gold pickup is collected
- **THEN** quest progress SHALL be 3 of 3 and the quest SHALL become complete

### Requirement: Runtime-only quest reset

The quest state, Object Spawner System objects, collected-pickup state, and pickup effects SHALL be runtime-only for this release. A browser refresh SHALL create a new game instance with a fresh Collect Gold quest and newly distributed level objects.

#### Scenario: Browser refresh starts a new quest and object set
- **WHEN** the player refreshes the browser after collecting Gold or Heart
- **THEN** the new game instance SHALL begin with Collect Gold at 0 of 3 and a newly generated object set

#### Scenario: Browser refresh starts a new quest
- **WHEN** the player refreshes the browser after collecting gold
- **THEN** the new game instance SHALL begin with Collect Gold at 0 of 3 and regenerated Gold pickups
