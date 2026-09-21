# Spec Delta

## Purpose

Provides one authoritative Babylon Lite system for defining, distributing, rendering, and colliding with glyph-based world objects, including both consumable pickups and persistent non-pickup objects.

## ADDED Requirements

### Requirement: JSON-defined object catalog

The Object Spawner System SHALL load a JSON object catalog whose entries define an object glyph, name, `IsPickup`, `IsLevelSpawned`, consequence parameters, optional log text, and distribution rules. Every catalog glyph SHALL exist in the active palette with an editable color.

#### Scenario: Catalog entry has palette identity
- **WHEN** the object catalog loads an object entry
- **THEN** its glyph SHALL resolve to a palette entry with a configured color before the object can be rendered

#### Scenario: Invalid glyph is rejected
- **WHEN** an object catalog entry references a glyph absent from the palette
- **THEN** the catalog load SHALL fail with an actionable validation error rather than rendering an unstyled object

### Requirement: Pickup and persistent-object behavior

The system SHALL treat `IsPickup: true` objects as one-time collectible objects that disappear after collision and apply their consequence. Objects with `IsPickup: false` SHALL remain in the world after collision; non-interactable objects SHALL not apply a collision consequence.

#### Scenario: Player collects a pickup
- **WHEN** the player enters a Heart or Gold pickup cell
- **THEN** the pickup SHALL disappear, apply its configured consequence once, and emit its configured log text

#### Scenario: Player enters a persistent trap
- **WHEN** the player enters a Trap cell
- **THEN** the Trap SHALL remain rendered and apply its configured health consequence

#### Scenario: Player enters a Torch cell
- **WHEN** the player enters a Torch cell
- **THEN** the Torch SHALL remain rendered, remain non-interactable, and produce no object log entry

### Requirement: Final level-spawn distribution pass

The Object Spawner System SHALL run as the final world-generation phase after player placement and SHALL distribute every catalog entry with `IsLevelSpawned: true` using its JSON distribution rules. Distribution SHALL use the resolved world seed and valid walkable cells without replacing terrain or player state.

#### Scenario: Level-spawned objects are distributed
- **WHEN** a realm finishes player placement
- **THEN** Hearts, Torches, Traps, and paired Stairs SHALL be distributed before the realm is published as playable

#### Scenario: Seeded distribution is repeatable
- **WHEN** the same realm seed, dimensions, catalog, and generation inputs are used twice
- **THEN** the object types and positions SHALL match exactly

### Requirement: Quest-requested object spawning

The system SHALL support runtime requests for `IsLevelSpawned: false` objects. The Collect Gold quest SHALL request exactly three Gold pickups at its configured target distances, and the Object Spawner System SHALL place them on valid cells.

#### Scenario: Quest requests Gold
- **WHEN** the Collect Gold quest starts
- **THEN** the Object Spawner System SHALL create exactly three Gold pickups and return their object identities to the active realm

#### Scenario: Gold is not ambiently distributed
- **WHEN** a realm completes its final level-spawn pass
- **THEN** no Gold SHALL be created unless the quest system has requested it

### Requirement: Object catalog defaults and player-facing logs

The initial catalog SHALL define Gold, Heart, Torch, Trap, and Stairs with the following behavior: Gold logs `Player collected +1 Gold from Gold`; Heart logs `Player collected +2 Health from Heart`; Trap logs `Player lost -2 Health from Trap`; Torch has no log text; and Stairs has no object log text because the Realm System owns both initial realm-entry and stair-transition logs. Distribution SHALL initially target approximately a 5% chance of seeing each level-spawned type on a zoom-5 screen in a 512x512 world, using approximately 10 to 14 instances per world where valid.

#### Scenario: Exact pickup log text
- **WHEN** the player collects Gold and then Heart
- **THEN** the log SHALL contain the exact configured capitalization and wording for each object

#### Scenario: Realm owns realm-entry log text
- **WHEN** the game starts in Underground or the player uses Stairs to enter Underground
- **THEN** the Realm System SHALL emit `Player entered the Underground Realm` and the Object Spawner System SHALL emit no Stairs log
