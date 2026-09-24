# Spec Delta

## MODIFIED Requirements

### Requirement: Death prompt uses the tutorial window format
When the player is dead, the React UI SHALL show a modal using the same window frame and typography format as the tutorial. The modal SHALL have the title `Adventure`, body text `You have died.`, a bulleted list containing exactly `XP: 00`, `Gold: 00`, and `Time: 00`, a button labeled `Restart from checkpoint`, and a button labeled `Restart game`. The `Restart from checkpoint` button SHALL be disabled when the current run has no active checkpoint and enabled when one exists.

#### Scenario: Death prompt is shown
- **WHEN** the bridge publishes the player's dead state
- **THEN** the UI SHALL show the `Adventure` modal with the exact body, bullet labels, `Restart from checkpoint` button, and `Restart game` button

#### Scenario: Checkpoint action availability reflects run state
- **WHEN** the death modal is shown before or after a checkpoint has been saved
- **THEN** `Restart from checkpoint` SHALL be disabled without a checkpoint and enabled with one

#### Scenario: Death prompt cannot be dismissed as a tutorial
- **WHEN** the death prompt is visible and the player clicks its backdrop or presses gameplay input
- **THEN** the death prompt SHALL remain visible and the run SHALL remain dead

### Requirement: Restart begins a fresh game session
Activating `Restart game` SHALL rebuild the game from the run's original random seed so the game layer and UI initialize a fresh run with the initial health, gold, time, quest, non-dead state, and no active checkpoint. This action SHALL not depend on browser-persistent checkpoint data.

#### Scenario: Restart game
- **WHEN** the player activates `Restart game`
- **THEN** the current run SHALL be replaced by a fresh run with the same original random seed and the normal initial game state
