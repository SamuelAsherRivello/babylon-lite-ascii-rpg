# Spec Delta

## ADDED Requirements

### Requirement: Publish generic successful cardinal movement events

The game layer SHALL dispatch a generic event for each successful cardinal
player movement using the explicit event meanings `player moved up`, `player
moved down`, `player moved left`, and `player moved right`. These events SHALL
be emitted for both keyboard and canvas-swipe movement. The game layer SHALL
not contain tutorial-specific state, sequencing, or completion logic. Any UI
consumer MAY listen for these events, but SHALL NOT receive or mutate player
coordinates, collision state, world cells, or movement timers.

#### Scenario: Keyboard movement event

- **WHEN** a mapped arrow-key input successfully moves the player one cardinal
  grid cell
- **THEN** the game dispatches exactly one corresponding generic player-moved
  event, such as `player moved up`

#### Scenario: Swipe movement event

- **WHEN** a cardinal canvas swipe successfully moves the player one grid cell
- **THEN** the game dispatches exactly one corresponding generic player-moved
  event

#### Scenario: Blocked movement event

- **WHEN** keyboard or swipe input cannot move the player into its destination
- **THEN** the game dispatches no player-moved event

#### Scenario: Diagonal movement events

- **WHEN** a diagonal input successfully moves the player
- **THEN** the game dispatches no cardinal player-moved event for that single
  diagonal step

#### Scenario: Tutorial remains an event consumer only

- **WHEN** the tutorial updates progress after receiving a player-moved event
- **THEN** the tutorial changes only its own UI state and the game contains no
  tutorial-specific progress or completion behavior
