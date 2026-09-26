# Spec Delta

## MODIFIED Requirements

### Requirement: JSON-defined object catalog

The Object Spawner System SHALL load a JSON object catalog whose entries define an object glyph, name, `IsPickup`, `IsLevelSpawned`, consequence parameters, optional log text, and distribution rules. Key entries SHALL be one-time pickups. Fence and door entries SHALL identify their closed/open glyphs and stateful collision behavior. Every catalog glyph SHALL exist in the active palette with an editable color. The checkpoint object SHALL use `CampFire` as its code and data identity and `Camp Fire` as its catalog name and every player-facing label.

#### Scenario: Civilization catalog entry has palette identity
- **WHEN** a key, fence, or door catalog entry loads
- **THEN** every state glyph SHALL resolve to a palette entry before rendering

#### Scenario: Catalog entry has palette identity
- **WHEN** the object catalog loads an object entry
- **THEN** its glyph SHALL resolve to a palette entry with a configured color before the object can be rendered

#### Scenario: Camp Fire catalog identity
- **WHEN** the checkpoint object catalog entry loads
- **THEN** its code and data identity SHALL be `CampFire` and its player-facing name SHALL be `Camp Fire`

#### Scenario: Invalid civilization glyph is rejected
- **WHEN** a civilization catalog entry references a glyph absent from the palette
- **THEN** catalog loading SHALL fail with an actionable validation error

#### Scenario: Invalid glyph is rejected
- **WHEN** an object catalog entry references a glyph absent from the palette
- **THEN** catalog loading SHALL fail with an actionable validation error

### Requirement: Pickup and persistent-object behavior

The system SHALL treat `IsPickup: true` objects as one-time collectible objects that disappear after collision and apply their consequence. Objects with `IsPickup: false` SHALL remain in the world after collision; persistent fences, Camp Fires, and closed doors SHALL block movement, closed doors SHALL unlock only when a key is available, and open doors SHALL permit movement. Non-interactable objects SHALL not apply a collision consequence. A cardinal attempt to enter a Camp Fire SHALL retain the player in the adjacent cell, save or replace the session checkpoint at that Camp Fire, and request a modal `Camp Fire` dialog with exactly one `OK` acknowledgement; it SHALL not create a checkpoint toast.

#### Scenario: Player collects a key pickup
- **WHEN** the player enters a key cell
- **THEN** the key SHALL disappear, increase the key count once, and emit the configured collection log

#### Scenario: Player collects a pickup
- **WHEN** the player enters a Heart or Gold pickup cell
- **THEN** the pickup SHALL disappear, apply its configured consequence once, and emit its configured log text

#### Scenario: Player enters a fence cell
- **WHEN** movement targets a fence
- **THEN** the movement SHALL be blocked and the fence SHALL remain rendered

#### Scenario: Player attempts a Camp Fire
- **WHEN** a player attempts a cardinal move into a Camp Fire cell
- **THEN** the Camp Fire SHALL remain rendered, the player SHALL remain adjacent, the checkpoint SHALL reference that Camp Fire, and a modal Camp Fire dialog with an `OK` choice SHALL be displayed without a toast

#### Scenario: Player acknowledges a Camp Fire dialog
- **WHEN** the player clicks the Camp Fire dialog's `OK` choice
- **THEN** the dialog SHALL close and gameplay input SHALL resume

#### Scenario: Player attempts a closed door
- **WHEN** movement targets a closed door
- **THEN** the system SHALL either log the locked state or spend a key and transition the door to open without moving the player

#### Scenario: Player enters an open door
- **WHEN** movement targets an open door
- **THEN** the player SHALL move into the doorway and the door SHALL remain open

#### Scenario: Player enters a persistent trap
- **WHEN** the player enters a Trap cell
- **THEN** the Trap SHALL remain rendered and apply its configured health consequence

#### Scenario: Dead player enters a persistent trap
- **WHEN** a dead player attempts to enter or collide with a Trap cell
- **THEN** the Trap SHALL not apply another health consequence or log entry

#### Scenario: Player enters a Torch cell
- **WHEN** the player enters a Torch cell
- **THEN** the Torch SHALL remain rendered, remain non-interactable, and produce no object log entry
