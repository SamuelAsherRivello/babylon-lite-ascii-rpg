# Spec Delta

## Purpose

Provides a short first-session tutorial that teaches movement through the
existing keyboard and swipe controls and confirms completion after cardinal
movement in all four directions.

## ADDED Requirements

### Requirement: Initial How To Play window

At the start of each new page/game session, unless the persisted skip choice is
enabled, the UI SHALL show a small, non-modal floating tutorial window styled
consistently with the existing Lighting window. The window SHALL have the
exact title `How To Play`, the exact instruction `Use arrow keys or swipe to
move. Hold to move faster.`, a primary `Next` button, and a secondary `Skip
Tutorial` button below it. The window SHALL NOT have a close `X` action.

#### Scenario: Tutorial opens with the game

- **WHEN** a new page/game session finishes initializing
- **THEN** the How To Play window is visible above the game with its exact
  title, instruction, primary `Next` button, and secondary `Skip Tutorial`
  button below it, without a close `X` action

#### Scenario: Continue from the movement instruction

- **WHEN** the player activates the How To Play window's `Next` button
- **THEN** the instruction window closes and the game remains available for
  keyboard or swipe movement

#### Scenario: Skip the movement tutorial

- **WHEN** the player activates the secondary `Skip Tutorial` button
- **THEN** the skip choice is persisted, the instruction window closes, and no
  completion window is shown during the current or future sessions

### Requirement: Cardinal movement completion tutorial

After the initial How To Play window has been dismissed with `Next`, the
tutorial SHALL listen only to the generic `player moved up`, `player moved
down`, `player moved left`, and `player moved right` events. It SHALL record
the directions represented by received events and SHALL not inspect keyboard,
pointer, swipe, player-coordinate, or collision state directly. Once all four
directions have been received, the UI SHALL immediately show a second small,
non-modal floating tutorial window with the exact title `Tutorial Complete` and
an `OK` action. The completion window SHALL NOT have a close `X` action.

#### Scenario: Record all four cardinal directions

- **WHEN** the tutorial receives at least one `player moved up`, `player moved
  down`, `player moved left`, and `player moved right` event after `Next`
- **THEN** the Tutorial Complete window appears immediately

#### Scenario: Ignore inputs without game events

- **WHEN** the game dispatches no player-moved event for an input attempt,
  including an attempt into a wall or outside the world
- **THEN** that attempt does not count toward any cardinal direction

#### Scenario: Diagonal movement does not dispatch cardinal tutorial events

- **WHEN** the player successfully moves diagonally and the game dispatches no
  cardinal player-moved event
- **THEN** the tutorial does not mark north, south, west, or east as completed
  from that step

#### Scenario: Acknowledge tutorial completion

- **WHEN** the player activates the Tutorial Complete window's `OK` action
- **THEN** the completion window closes and the tutorial remains finished for
  the current page/game session

### Requirement: Tutorial skip state persists

The tutorial SHALL persist true when the player activates `Skip Tutorial` and
SHALL skip both tutorial windows in later sessions when the stored skip value is
true. An absent skip value SHALL be treated as false. The tutorial SHALL not
expose a separate close action that bypasses its buttons.

#### Scenario: First session is not skipped

- **WHEN** no tutorial skip value exists
- **THEN** the How To Play window appears

#### Scenario: Stored skip skips the tutorial

- **WHEN** a later page/game session initializes with the persisted skip value
  true
- **THEN** neither tutorial window appears

### Requirement: Tutorial controls are isolated from gameplay input

Tutorial window controls SHALL consume their own pointer and keyboard
activation interactions. Activating `Next` or `Skip Tutorial` SHALL not begin a
canvas swipe, change player position, or alter movement repeat timing.

#### Scenario: Interact with tutorial controls

- **WHEN** the player clicks, taps, or keyboard-activates `Next` or `Skip
  Tutorial`
- **THEN** only the tutorial action occurs and no gameplay movement input is
  started by that interaction
