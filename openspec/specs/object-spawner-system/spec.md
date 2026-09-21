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

The Object Spawner System SHALL run after player placement and SHALL
distribute every catalog entry with `IsLevelSpawned: true` using its JSON
distribution rules. Underground civilization distribution SHALL then select
eligible screen regions with a seeded approximately 10% chance and place
solvable fence, door, and key groups without replacing terrain or player
state.

#### Scenario: Underground civilization is distributed
- **WHEN** an Underground realm finishes player placement and existing object
  distribution
- **THEN** eligible civilization groups SHALL be considered before the realm
  is published as playable

#### Scenario: Level-spawned objects are distributed
- **WHEN** a realm finishes player placement
- **THEN** Hearts, Torches, Traps, and paired Stairs SHALL be distributed
  before the realm is published as playable

#### Scenario: Overground has no civilization group
- **WHEN** an Overground realm completes its final level-spawn pass
- **THEN** no fence, door, or key group SHALL be created

#### Scenario: Seeded distribution is repeatable
- **WHEN** the same realm seed, dimensions, catalog, and generation inputs are
  used twice
- **THEN** object types, civilization states, and positions SHALL match exactly

### Requirement: Quest-requested object spawning

The system SHALL support runtime requests for `IsLevelSpawned: false` objects. The Collect Gold quest SHALL request exactly three Gold pickups at its configured target distances, and the Object Spawner System SHALL place them on valid cells.

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
