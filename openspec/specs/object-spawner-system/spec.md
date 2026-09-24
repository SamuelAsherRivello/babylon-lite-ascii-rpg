# object-spawner-system Specification

## Purpose
Provides one authoritative Babylon Lite system for defining, distributing, rendering, and colliding with glyph-based world objects, including both consumable pickups and persistent non-pickup objects.

## Requirements

### Requirement: JSON-defined object catalog

The Object Spawner System SHALL load a JSON object catalog whose entries define
an object glyph, name, `IsPickup`, `IsLevelSpawned`, consequence parameters,
optional log text, and distribution rules. Key entries SHALL be one-time
pickups. Fence and door entries SHALL identify their closed/open glyphs and
stateful collision behavior. Every catalog glyph SHALL exist in the active
palette with an editable color.

#### Scenario: Civilization catalog entry has palette identity
- **WHEN** a key, fence, or door catalog entry loads
- **THEN** every state glyph SHALL resolve to a palette entry before rendering

#### Scenario: Catalog entry has palette identity
- **WHEN** the object catalog loads an object entry
- **THEN** its glyph SHALL resolve to a palette entry with a configured color
  before the object can be rendered

#### Scenario: Invalid civilization glyph is rejected
- **WHEN** a civilization catalog entry references a glyph absent from the
  palette
- **THEN** catalog loading SHALL fail with an actionable validation error

#### Scenario: Invalid glyph is rejected
- **WHEN** an object catalog entry references a glyph absent from the palette
- **THEN** the catalog load SHALL fail with an actionable validation error

### Requirement: Pickup and persistent-object behavior

The system SHALL treat `IsPickup: true` objects as one-time collectible
objects that disappear after collision and apply their consequence. Objects
with `IsPickup: false` SHALL remain in the world after collision; persistent
fences SHALL block movement, closed doors SHALL unlock only when a key is
available, and open doors SHALL permit movement. Non-interactable objects
SHALL not apply a collision consequence.

#### Scenario: Player collects a key pickup
- **WHEN** the player enters a key cell
- **THEN** the key SHALL disappear, increase the key count once, and emit the
  configured collection log

#### Scenario: Player collects a pickup
- **WHEN** the player enters a Heart or Gold pickup cell
- **THEN** the pickup SHALL disappear, apply its configured consequence once,
  and emit its configured log text

#### Scenario: Player enters a fence cell
- **WHEN** movement targets a fence
- **THEN** the movement SHALL be blocked and the fence SHALL remain rendered

#### Scenario: Player attempts a closed door
- **WHEN** movement targets a closed door
- **THEN** the system SHALL either log the locked state or spend a key and
  transition the door to open without moving the player

#### Scenario: Player enters an open door
- **WHEN** movement targets an open door
- **THEN** the player SHALL move into the doorway and the door SHALL remain open

#### Scenario: Player enters a persistent trap
- **WHEN** the player enters a Trap cell
- **THEN** the Trap SHALL remain rendered and apply its configured health
  consequence

#### Scenario: Dead player enters a persistent trap
- **WHEN** a dead player attempts to enter or collide with a Trap cell
- **THEN** the Trap SHALL not apply another health consequence or log entry

#### Scenario: Player enters a Torch cell
- **WHEN** the player enters a Torch cell
- **THEN** the Torch SHALL remain rendered, remain non-interactable, and
  produce no object log entry

### Requirement: Final level-spawn distribution pass
The Object Spawner System SHALL run after player placement and SHALL distribute each catalog entry with `IsLevelSpawned: true` only when its corresponding generation pass is enabled, using its JSON distribution rules. Disabled ambient object passes SHALL create no objects of that type. Underground civilization distribution SHALL then select eligible screen regions with a seeded approximately 10% chance and place solvable fence, door, and key groups only when its enabled sublayer runs, without replacing terrain or player state.

#### Scenario: Underground civilization is distributed
- **WHEN** an Underground realm finishes player placement and enabled existing object distribution
- **THEN** eligible enabled civilization groups SHALL be considered before the realm is published as playable

#### Scenario: Level-spawned objects are distributed
- **WHEN** a realm finishes player placement with a level-spawned object pass enabled
- **THEN** that object type SHALL be distributed before the realm is published as playable

#### Scenario: Disabled object distribution is absent
- **WHEN** a realm is generated with Heart Distribution disabled
- **THEN** no ambient Heart objects SHALL be created while other enabled object passes remain eligible to run

#### Scenario: Overground has no civilization group
- **WHEN** an Overground realm completes its final level-spawn pass
- **THEN** no fence, door, or key group SHALL be created

#### Scenario: Seeded distribution is repeatable
- **WHEN** the same realm seed, dimensions, catalog, and generation inputs are used twice
- **THEN** enabled object types, civilization states, and positions SHALL match exactly

### Requirement: Quest-requested object spawning

The system SHALL support client requests for `IsLevelSpawned: false` objects. The Collect Gold quest SHALL request exactly three Gold pickups at its configured target distances, and the Object Spawner System SHALL place them on valid cells.

#### Scenario: Quest requests Gold
- **WHEN** the Collect Gold quest starts
- **THEN** the Object Spawner System SHALL create exactly three Gold pickups and return their object identities to the active realm

#### Scenario: Gold is not ambiently distributed
- **WHEN** a realm completes its final level-spawn pass
- **THEN** no Gold SHALL be created unless the quest system has requested it

### Requirement: Object catalog defaults and player-facing logs

The initial catalog SHALL retain the existing Gold, Heart, Torch, Trap, and
Stairs behavior and SHALL add Key, Fence, and Door definitions for the
Underground civilization pass. Civilization logs SHALL use the exact messages
`The key was collected.`, `The door is locked.`, `A key was spent.`, and `The
door unlocked.`. All civilization messages SHALL use past-tense wording.

#### Scenario: Exact civilization pickup and door logs
- **WHEN** the player collects a key, tries a locked door without a key, and
  unlocks a door with a key
- **THEN** the log SHALL contain the exact configured civilization messages in
  event order

#### Scenario: Exact pickup log text
- **WHEN** the player collects Gold and then Heart
- **THEN** the log SHALL contain the exact configured capitalization and
  wording for each object

#### Scenario: Exact Trap consequence and log text
- **WHEN** the player enters a Trap while alive
- **THEN** health SHALL decrease by `25`, be clamped at `0` when necessary,
  and the log SHALL contain the exact text `Player lost -25 Health from Trap`

#### Scenario: Realm owns realm-entry log text
- **WHEN** the game starts in Underground or the player uses Stairs to enter
  Underground
- **THEN** the Realm System SHALL emit `Player entered the Underground Realm`
  and the Object Spawner System SHALL emit no Stairs log

### Requirement: Selected per-object distribution profiles
The Object Spawner System SHALL apply independently selected Heart, Trap, and Torch distribution profiles to their respective level-spawned counts while retaining deterministic seeded placement and existing occupancy exclusions.

#### Scenario: High Heart distribution remains deterministic
- **WHEN** a realm is generated twice with the same seed and High Heart distribution
- **THEN** the Heart count and positions SHALL match, while Trap and Torch counts continue to use their independently selected profiles

### Requirement: Treasure chest catalog and deterministic distribution
The Object Spawner System SHALL define a level-spawned non-pickup Treasure Chest with distinct closed and open glyphs, both present in the active palette. For each realm, it SHALL deterministically distribute one, two, or three closed chests for the selected Low, Med, or High Chest profile respectively. Each chest SHALL occupy an otherwise eligible walkable cell whose Euclidean grid-cell distance from that realm's player-start cell is at most 50, while retaining existing placement exclusions.

#### Scenario: Chest profile produces the selected count in each realm
- **WHEN** a world is generated with Low, Med, or High Chest distribution
- **THEN** each realm SHALL contain one, two, or three eligible closed chests respectively within 50 grid cells of its own player start

#### Scenario: Chest distribution is seeded
- **WHEN** the same realm seed and Chest profile are used twice
- **THEN** chest positions and initial closed state SHALL match

### Requirement: Cardinal chest opening and spent state
The Object Spawner System SHALL block movement into a closed Treasure Chest. When a player attempts a cardinal move into that cell, the chest SHALL change immediately to its open glyph, remain rendered, and become spent. A spent chest SHALL remain blocking and SHALL not create another reward on later cardinal bump attempts.

#### Scenario: Cardinal movement opens a chest
- **WHEN** the player attempts to move left, right, up, or down into a closed Treasure Chest
- **THEN** the player SHALL remain in the adjacent cell and the chest SHALL render its open glyph

#### Scenario: Opened chest remains blocking
- **WHEN** the player later attempts a cardinal move into an opened Treasure Chest cell
- **THEN** the player SHALL remain adjacent and the chest SHALL not create another reward

### Requirement: Chest reward spawning
The Object Spawner System SHALL select a chest reward from a weighted subset of catalog object types and create exactly one instance using the selected object type's normal behavior. The initial Treasure Chest reward table SHALL select Heart with 100 percent probability. On opening, the selected reward SHALL spawn on one randomly selected empty walkable cell among the eight cells surrounding the chest that is not occupied by the player.

#### Scenario: Opening a chest creates a Heart
- **WHEN** the player opens a closed Treasure Chest
- **THEN** exactly one Heart SHALL appear on an eligible empty surrounding cell, including a diagonal when selected, be written to the visible world grid, and retain normal Heart pickup behavior

#### Scenario: No eligible reward cell preserves the spent chest
- **WHEN** a chest opens with no empty walkable surrounding cell other than the player's cell
- **THEN** the chest SHALL become open and spent without creating a reward

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

### Requirement: Chest interaction completes on the first valid cardinal step
The movement integration MUST attempt chest interaction for a cardinal destination after combat resolution reports no handled combat collision, and MUST open a closed chest during that same input without requiring a second step.

#### Scenario: First step into a chest opens it
- **WHEN** the player is cardinally adjacent to a closed chest and steps toward it
- **AND** no combat collision handles the attempted destination
- **THEN** the chest opens on that input
- **AND** the player remains in the originating cell

### Requirement: Opened chests spawn one guaranteed heart only in a valid neighboring cell
When a chest reward is a heart, the system MUST select one of the eight surrounding cells that is walkable and not occupied by the player or any active object. The chest MUST still open if no such cell exists, but MUST not place a heart in an invalid cell.

#### Scenario: Heart avoids all occupied neighbors
- **WHEN** a chest opens with a heart reward
- **THEN** exactly one heart is added when at least one surrounding cell is valid
- **AND** its cell is walkable
- **AND** its cell is not the player cell
- **AND** its cell is not occupied by any active object
