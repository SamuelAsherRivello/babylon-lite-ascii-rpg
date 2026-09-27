# Spec Delta

## MODIFIED Requirements

### Requirement: Pickup and persistent-object behavior

The system SHALL treat `IsPickup: true` objects as one-time collectible objects that disappear after collision and apply their consequence. Objects with `IsPickup: false` SHALL remain in the world after collision; persistent fences, Camp Fires, locked doors, and closed doors SHALL block movement. Locked doors SHALL unlock only when a key is available; closed doors SHALL remain blocking without consuming a key; and open doors SHALL permit movement. Newly generated doors SHALL be locked. A cardinal attempt against a locked door with a key SHALL spend one key and transition it directly to open without moving the player. A cardinal attempt without a key SHALL leave it locked. Non-interactable objects SHALL not apply a collision consequence.

#### Scenario: Player collects a key pickup
- **WHEN** the player enters a key cell
- **THEN** the key SHALL disappear, increase the key count once, and emit the configured collection log

#### Scenario: Player collects a pickup
- **WHEN** the player enters a Heart or Gold pickup cell
- **THEN** the pickup SHALL disappear, apply its configured consequence once, and emit its configured log text

#### Scenario: Player enters a fence cell
- **WHEN** movement targets a fence
- **THEN** the movement SHALL be blocked and the fence SHALL remain rendered

#### Scenario: Player saves at a Camp Fire
- **WHEN** a player first attempts a cardinal move into a Camp Fire cell in the game session
- **THEN** the Camp Fire SHALL remain rendered, the player SHALL remain adjacent, the checkpoint SHALL reference that Camp Fire, and a modal Camp Fire dialog with an `OK` choice and text `You saved a checkpoint.` SHALL be displayed without a toast

#### Scenario: Player revisits a saved Camp Fire
- **WHEN** a player later attempts a cardinal move into the same Camp Fire cell in the game session
- **THEN** the Camp Fire SHALL remain rendered, the player SHALL remain adjacent, the checkpoint SHALL remain unchanged, and a modal Camp Fire dialog with an `OK` choice and text `You already saved a checkpoint.` SHALL be displayed without a toast

#### Scenario: Player acknowledges a Camp Fire dialog
- **WHEN** the player clicks the Camp Fire dialog's `OK` choice
- **THEN** the dialog SHALL close and gameplay input SHALL resume

#### Scenario: Player attempts a locked door without a key
- **WHEN** movement targets a locked door and the player has zero keys
- **THEN** the player SHALL remain in place, the door SHALL remain locked, and `The door is locked.` SHALL be logged

#### Scenario: Player unlocks a locked door with a key
- **WHEN** movement targets a locked door and the player has a key
- **THEN** exactly one key SHALL be spent, the door SHALL become open, the player SHALL remain in place, and the existing key-spent and door-unlocked logs SHALL be emitted

#### Scenario: Player attempts a closed door
- **WHEN** movement targets a closed door
- **THEN** the player SHALL remain in place and the door SHALL remain closed without consuming a key

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
