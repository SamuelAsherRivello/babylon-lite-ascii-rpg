# Spec Delta

## MODIFIED Requirements

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
