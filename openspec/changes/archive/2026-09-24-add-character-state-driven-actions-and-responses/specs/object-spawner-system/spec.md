# Spec Delta

## MODIFIED Requirements

### Requirement: Pickup and persistent-object behavior

The system SHALL treat `IsPickup: true` objects as one-time collectible objects that disappear after collision and apply their consequence. Objects with `IsPickup: false` SHALL remain in the world after collision. Persistent fences SHALL block movement. A closed door SHALL be offered as a contact target and open only when the Keys resource responds; an open door SHALL permit movement. A closed Treasure Chest SHALL be offered as a contact target and open through the intrinsic body response. Non-interactable objects SHALL not apply a collision consequence.

#### Scenario: Player collects a key pickup

- **WHEN** the player enters a key cell
- **THEN** the key disappears, increases the Key count once, and emits the configured collection log

#### Scenario: Player enters a pickup

- **WHEN** the player enters a Heart or Gold pickup cell
- **THEN** the pickup disappears, applies its configured consequence once, and emits its configured log text

#### Scenario: Player collects a pickup
- **WHEN** the player enters a Heart or Gold pickup cell
- **THEN** the pickup disappears, applies its configured consequence once, and emits its configured log text

#### Scenario: Player enters a fence cell

- **WHEN** movement targets a fence
- **THEN** movement is blocked and the fence remains rendered

#### Scenario: Key resource opens a closed door

- **WHEN** cardinal movement contacts a closed door while the player has a Key
- **THEN** one Key is spent, the door opens, and the player remains in the origin cell

#### Scenario: Player contacts a closed door without a key

- **WHEN** cardinal movement contacts a closed door while the player has no Key
- **THEN** the player remains in place and the contact consumes one normal movement tick without opening the door

#### Scenario: Player attempts a closed door
- **WHEN** movement targets a closed door
- **THEN** the system logs the locked state or spends a Key and opens the door without moving the player

#### Scenario: Player enters an open door

- **WHEN** movement targets an open door
- **THEN** the player moves into the doorway and the door remains open

#### Scenario: Player enters a persistent trap

- **WHEN** the player enters a Trap cell
- **THEN** the Trap remains rendered and applies its configured health consequence

#### Scenario: Dead player enters a persistent trap

- **WHEN** a dead player attempts to enter or collide with a Trap cell
- **THEN** the Trap does not apply another health consequence or log entry

#### Scenario: Player enters a Torch cell

- **WHEN** the player enters a Torch cell
- **THEN** the Torch remains rendered, remains non-interactable, and produces no object log entry

### Requirement: Cardinal chest opening and spent state

The Object Spawner System SHALL block movement into a closed Treasure Chest. When the body response handles a cardinal contact with that cell, the chest SHALL change immediately to its open glyph, remain rendered, and become spent. A spent chest SHALL remain blocking and SHALL not create another reward on later cardinal bump attempts.

#### Scenario: Cardinal contact opens a chest

- **WHEN** the player attempts to move left, right, up, or down into a closed Treasure Chest
- **THEN** the player remains in the adjacent cell and the chest renders its open glyph

#### Scenario: Cardinal movement opens a chest
- **WHEN** the player attempts to move left, right, up, or down into a closed Treasure Chest
- **THEN** the player remains in the adjacent cell and the chest renders its open glyph

#### Scenario: Opened chest remains blocking

- **WHEN** the player later attempts cardinal movement into an opened Treasure Chest cell
- **THEN** the player remains adjacent and the chest does not create another reward
