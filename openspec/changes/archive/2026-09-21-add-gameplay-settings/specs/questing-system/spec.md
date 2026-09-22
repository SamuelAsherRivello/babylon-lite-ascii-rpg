# Spec Delta

## MODIFIED Requirements

### Requirement: Current quest lifecycle

The system SHALL maintain an active-quest list containing only the current quest for this release. Each quest SHALL expose `unstarted`, `pending`, and `complete` states, and SHALL transition to `pending` automatically when the initial game instance starts using the saved valid Default Quest, or the first quest definition when no valid default exists.

#### Scenario: Initial default quest starts with the game

- **WHEN** a new game instance finishes initializing with a valid saved Default Quest
- **THEN** the saved default quest SHALL be pending with its initial progress

#### Scenario: Initial quest starts in Overground

- **WHEN** a new game instance finishes initializing in Overground
- **THEN** the configured initial quest SHALL be pending with its first step determined by the initial active realm

#### Scenario: Initial quest starts with the game

- **WHEN** a new game instance finishes initializing
- **THEN** the configured initial quest SHALL be pending with its initial progress

#### Scenario: Initial quest starts from the saved default

- **WHEN** a new game instance finishes initializing with a valid saved Default Quest
- **THEN** that quest SHALL be pending with its initial progress

#### Scenario: Missing default starts the first quest

- **WHEN** a new game instance finishes initializing without a valid saved Default Quest
- **THEN** the first quest definition SHALL be saved as the Default Quest and become pending

#### Scenario: Initial quest falls back without a valid default

- **WHEN** a new game instance finishes initializing without a valid saved Default Quest
- **THEN** the first quest definition SHALL be saved as the Default Quest and become pending

#### Scenario: Initial quest starts in Underground

- **WHEN** a new game instance finishes initializing in Underground
- **THEN** the configured initial quest SHALL be pending with its first step determined by the initial active realm

#### Scenario: Selecting a quest changes the current quest

- **WHEN** the player selects a quest from Gameplay Settings
- **THEN** that quest SHALL replace the current quest and transition to pending with fresh client progress

#### Scenario: Completed quest advances when another definition exists

- **WHEN** the current quest reaches its target and a later quest definition exists
- **THEN** the next available quest in definition order SHALL become pending

#### Scenario: Final completed quest remains current

- **WHEN** the current quest reaches its target and no later quest definition exists
- **THEN** the quest SHALL become complete and remain in the active-quest list

#### Scenario: Completed quest remains current

- **WHEN** the current quest reaches its target and no later quest definition exists
- **THEN** the current quest SHALL become complete and remain in the active-quest list

### Requirement: Client-only quest reset

The quest state, Object Spawner System objects, collected-pickup state, and pickup effects SHALL be client-only for this release. A browser refresh SHALL create a new game instance with a fresh client state for the saved valid Default Quest, or the first quest when the saved default is absent or invalid, and newly distributed level objects.

#### Scenario: Browser refresh starts the saved default quest and object set

- **WHEN** the player refreshes the browser after collecting Gold or Heart
- **THEN** the new game instance SHALL begin with the saved valid Default Quest at its initial progress and a newly generated object set

#### Scenario: Refresh in Overground

- **WHEN** the player refreshes the browser while the active realm is Overground
- **THEN** the new game instance SHALL begin with the saved valid Default Quest at its initial progress and client-generated pickups appropriate to its initial realm

#### Scenario: Refresh in Underground

- **WHEN** the player refreshes the browser while the stored active realm is Underground
- **THEN** the new game instance SHALL begin with the saved valid Default Quest at its initial progress and without quest gold pickups before the prerequisite is satisfied

#### Scenario: Browser refresh starts a new quest and object set

- **WHEN** the player refreshes the browser after collecting Gold or Heart
- **THEN** the new game instance SHALL begin with the saved valid Default Quest at its initial progress and a newly generated object set

#### Scenario: Browser refresh falls back safely

- **WHEN** the saved Default Quest is absent or no longer matches a quest definition
- **THEN** the new game instance SHALL save and begin the first quest definition with regenerated quest pickups

#### Scenario: Browser refresh starts a new quest

- **WHEN** the player refreshes the browser after collecting gold
- **THEN** the new game instance SHALL begin with the configured initial quest at its initial progress and regenerated quest pickups

#### Scenario: Browser refresh restores the saved default without progress

- **WHEN** the player refreshes the browser after selecting a valid Default Quest
- **THEN** the new game instance SHALL begin with that quest at fresh client progress and newly generated client objects
