# Spec Delta

## MODIFIED Requirements

### Requirement: Current quest lifecycle

The system SHALL maintain an active-quest list containing only the current quest for this release. Each quest SHALL expose `unstarted`, `pending`, and `complete` states, and SHALL transition to `pending` automatically when the initial game instance starts using the saved valid Default Quest, or the first quest definition when no valid default exists. When the current quest completes and a later uncompleted quest definition exists, the next available quest in definition order SHALL become the pending current quest during the same session. When no uncompleted quest remains, the final completed quest SHALL remain the current active quest and SHALL NOT restart or loop.

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
- **THEN** that quest SHALL replace the current quest and transition to pending with fresh runtime progress

#### Scenario: Completed quest advances when another definition exists

- **WHEN** the current quest reaches its target and a later uncompleted quest definition exists
- **THEN** the completed quest SHALL be published as complete, the next available quest in definition order SHALL become pending, and the HUD SHALL update to that next quest

#### Scenario: Final completed quest remains current

- **WHEN** the current quest reaches its target and no later uncompleted quest definition exists
- **THEN** the quest SHALL become complete, remain in the active-quest list, and SHALL not be started again during the session

#### Scenario: Completed quest remains current

- **WHEN** the current quest reaches its target and no later quest definition exists
- **THEN** the current quest SHALL become complete and remain in the active-quest list

### Requirement: Quest lifecycle toasts

The system SHALL show a toast when the current quest starts, when an ordered step completes or advances, and when the quest completes. Toasts SHALL identify the relevant step or quest state and SHALL preserve the existing Collect Gold quest-start and quest-completion notifications. When completion automatically advances to another quest, the completion toast SHALL be enqueued before the next quest's start toast so the two messages are displayed FIFO.

#### Scenario: Realm step completes

- **WHEN** the player enters Overground and completes the first step
- **THEN** the toast system SHALL report completion of `Enter Overground Realm` and activation of the Collect Gold step

#### Scenario: Quest starts

- **WHEN** the initial quest transitions from unstarted to pending
- **THEN** the toast system SHALL show `Quest Started: Collect Gold.`

#### Scenario: Gold advances

- **WHEN** a gold pickup increases progress from zero to one
- **THEN** the toast system SHALL report `Collect Gold 1 of 3`

#### Scenario: Quest advances

- **WHEN** a gold pickup increases progress from zero to one
- **THEN** the toast system SHALL report `Collect Gold 1 of 3`

#### Scenario: Quest completes

- **WHEN** the third gold pickup completes the final step
- **THEN** the toast system SHALL show `Quest Completed: Collect Gold.`

#### Scenario: Completion starts the next quest in order

- **WHEN** a completed quest has a later uncompleted quest definition
- **THEN** the toast system SHALL show `Quest Completed: <completed title>.` before `Quest Started: <next title>.`

#### Scenario: Completion does not loop the final quest

- **WHEN** the final uncompleted quest completes
- **THEN** the toast system SHALL show only its completion toast and SHALL not show another start toast for that quest

### Requirement: Quest HUD tracker

The HUD SHALL render the current quest 25px below the character box. The title line SHALL read `Quest: Collect Gold`. The body SHALL render the ordered steps in order: `Enter Overground Realm`, followed by `Collect Gold 0 of 3` while gold collection is pending. Completed steps SHALL remain visible with completed styling, and the quest SHALL remain visible with completed styling after the final gold pickup. When a later quest starts automatically, the HUD SHALL replace the completed quest with the new quest's title and initial active step. When the final quest completes, the HUD SHALL keep that quest visible with its completed, struck-through styling.

#### Scenario: Underground prerequisite presentation

- **WHEN** the current quest is pending in Underground
- **THEN** the HUD SHALL show `Enter Overground Realm` as the active step and SHALL not present gold collection as active progress

#### Scenario: Active quest presentation

- **WHEN** the current quest is pending with zero gold progress
- **THEN** the HUD SHALL show the title and ordered active step beneath the character box with the required spacing and text

#### Scenario: Overground collection presentation

- **WHEN** the realm step is complete and no gold has been collected
- **THEN** the HUD SHALL show the completed `Enter Overground Realm` step and `Collect Gold 0 of 3`

#### Scenario: Completed quest presentation

- **WHEN** the third gold pickup completes the final step
- **THEN** the HUD SHALL keep both steps visible and apply completed styling to the quest steps

#### Scenario: Next quest replaces the completed quest

- **WHEN** one quest completes and another quest starts automatically
- **THEN** the HUD SHALL show the newly started quest and its initial step after the completion state is published

#### Scenario: Final quest remains struck through

- **WHEN** all quest definitions have completed during the session
- **THEN** the HUD SHALL keep the final quest visible as completed and struck through without restarting it
