# Spec Delta

## MODIFIED Requirements

### Requirement: Pickup and persistent-object behavior

The system SHALL treat `IsPickup: true` objects as one-time collectible objects that disappear after collision and apply their consequence. Objects with `IsPickup: false` SHALL remain in the world after collision and apply their configured persistent consequence only while the player is alive; non-interactable objects SHALL not apply a collision consequence.

#### Scenario: Player collects a pickup
- **WHEN** the player enters a Heart or Gold pickup cell
- **THEN** the pickup SHALL disappear, apply its configured consequence once, and emit its configured log text

#### Scenario: Player enters a persistent trap
- **WHEN** the player enters a Trap cell while alive
- **THEN** the Trap SHALL remain rendered and apply its configured health consequence

#### Scenario: Dead player enters a persistent trap
- **WHEN** a dead player attempts to enter or collide with a Trap cell
- **THEN** the Trap SHALL not apply another health consequence or log entry

#### Scenario: Player enters a Torch cell
- **WHEN** the player enters a Torch cell
- **THEN** the Torch SHALL remain rendered, remain non-interactable, and produce no object log entry

### Requirement: Object catalog defaults and player-facing logs

The initial catalog SHALL define Gold, Heart, Torch, Trap, and Stairs with the following behavior: Gold logs `Player collected +1 Gold from Gold`; Heart logs `Player collected +2 Health from Heart`; Trap applies `-25` health and logs `Player lost -25 Health from Trap`; Torch has no log text; and Stairs has no object log text because the Realm System owns both initial realm-entry and stair-transition logs. Distribution SHALL initially target approximately a 5% chance of seeing each level-spawned type on a zoom-5 screen in a 512x512 world, using approximately 10 to 14 instances per world where valid.

#### Scenario: Exact Trap consequence and log text
- **WHEN** the player enters a Trap while alive
- **THEN** health SHALL decrease by `25`, be clamped at `0` when necessary, and the log SHALL contain the exact text `Player lost -25 Health from Trap`

#### Scenario: Exact pickup log text
- **WHEN** the player collects Gold and then Heart
- **THEN** the log SHALL contain the exact configured capitalization and wording for each object

#### Scenario: Realm owns realm-entry log text
- **WHEN** the game starts in Underground or the player uses Stairs to enter Underground
- **THEN** the Realm System SHALL emit `Player entered the Underground Realm` and the Object Spawner System SHALL emit no Stairs log
