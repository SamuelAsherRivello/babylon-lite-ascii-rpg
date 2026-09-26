# player-lifecycle Specification

## Purpose

Defines the player's health-to-death lifecycle and the user-facing recovery prompt so a run ends deterministically and can be restarted without exposing mutable game state to React.

## Requirements

### Requirement: Health depletion reaches an authoritative death state

The game layer SHALL clamp player health to `0` when a health consequence would make it non-positive. The first transition to health `0` SHALL mark the player dead and SHALL publish an immutable death-state snapshot through the existing bridge.

#### Scenario: Trap reduces health above zero
- **WHEN** the player enters a Trap cell with more than `25` health
- **THEN** health SHALL decrease by exactly `25`, remain positive, and the player SHALL remain alive

#### Scenario: Trap reaches zero health
- **WHEN** the player enters a Trap cell with `25` or less health
- **THEN** health SHALL be published as exactly `0` and the player SHALL transition to dead

#### Scenario: Death transition is idempotent
- **WHEN** a dead player receives another attempted health consequence
- **THEN** health SHALL remain `0` and no second death transition SHALL be published

### Requirement: Dead players cannot continue the run

Immediately after the player becomes dead, the game layer SHALL reject keyboard, held-key, canvas-swipe, pointer-navigation, combat, collision, targeting, and other gameplay actions; it SHALL not apply further object consequences or advance world time. UI controls that do not invoke a gameplay action SHALL remain operable throughout the death presentation and recovery state.

#### Scenario: Gameplay input during the death presentation
- **WHEN** a player uses keyboard, swipe, pointer-navigation, or combat input after the authoritative death transition and before the recovery prompt is visible
- **THEN** the player cell, world time, health, rewards, quest state, log, and rendered run state SHALL remain unchanged

#### Scenario: Movement after death
- **WHEN** a player attempts keyboard or canvas-swipe movement after death
- **THEN** the player cell, world time, and rendered run state SHALL remain unchanged

#### Scenario: UI input during the death presentation
- **WHEN** a player interacts with a non-gameplay UI control after the authoritative death transition
- **THEN** that UI control SHALL remain operable and SHALL not resume or mutate the dead run

#### Scenario: Consequence after death
- **WHEN** an object collision is attempted after death
- **THEN** no health, gold, quest, log, or time state SHALL change

### Requirement: Death prompt uses the tutorial window format

When the player becomes dead, the game SHALL first play the existing death animation to its final frozen frame, then wait exactly 500 ms before making the React recovery prompt visible. The prompt SHALL use the same window frame and typography format as the tutorial. It SHALL have the title `Adventure`, body text `You have died.`, a bulleted list containing exactly `XP: 00`, `Gold: 00`, and `Time: 00`, and a button labeled `Restart Game`. It SHALL not be visible, and its restart actions SHALL not be available, before the animation and 500 ms wait have completed.

#### Scenario: Death prompt is delayed until after the death presentation
- **WHEN** the player's health reaches zero
- **THEN** gameplay SHALL lock immediately, the complete death animation SHALL remain visible, and the recovery prompt SHALL become visible exactly 500 ms after that animation reaches its final frame

#### Scenario: Death prompt is shown
- **WHEN** the death animation has reached its final frame and the subsequent 500 ms wait has elapsed
- **THEN** the UI SHALL show the `Adventure` modal with the exact body, bullet labels, and `Restart Game` button

#### Scenario: Death prompt cannot be dismissed as a tutorial
- **WHEN** the death prompt is visible and the player clicks its backdrop or presses gameplay input
- **THEN** the death prompt SHALL remain visible and the run SHALL remain dead

#### Scenario: Restart is unavailable during the death presentation
- **WHEN** the complete death animation or its 500 ms wait is still in progress
- **THEN** no restart action SHALL be exposed or accepted

### Requirement: Restart begins a fresh game session

Activating `Restart Game` SHALL reload the current game page so the game layer and UI initialize a fresh run with the initial health, gold, time, quest, and non-dead state.

#### Scenario: Restart game
- **WHEN** the player activates `Restart Game`
- **THEN** the current page SHALL reload and the new session SHALL begin with the normal initial game state

### Requirement: Player starts at full health

Each new game session SHALL initialize the player with current health `125` and maximum health `125` before gameplay entities process world time `1`.

#### Scenario: New player health
- **WHEN** a new game session starts
- **THEN** the authoritative player lifecycle SHALL report 125 current health and the player SHALL be alive

### Requirement: Enemy attacks use the authoritative player lifecycle

Enemy attack damage SHALL be applied through the existing authoritative player-health and death boundary. Each valid enemy attack SHALL apply `-5` health, clamp at zero, publish the resulting immutable health snapshot, and trigger the existing one-time death transition when health reaches zero.

#### Scenario: Enemy damages living player
- **WHEN** an enemy attacks a player with more than 5 health
- **THEN** player health SHALL decrease by exactly 5 and the player SHALL remain alive

#### Scenario: Enemy attack reaches zero
- **WHEN** an enemy attacks a player with 5 or less health
- **THEN** player health SHALL become exactly zero and the existing death state SHALL be published once
