# time-system Specification

## Purpose

Provides a deterministic world-time counter that future gameplay systems can
observe while making successful player movement the first time-consuming action.

## Requirements

### Requirement: World time starts at one

The Time System SHALL initialize each new game at time unit `1` and SHALL
expose the current value to the game UI and future gameplay systems.

#### Scenario: New game time

- **WHEN** a new game view is started
- **THEN** the current world time SHALL be `1`

### Requirement: Successful movement advances world time

The Time System SHALL increase world time by exactly one after each successful
cardinal or diagonal player movement into a different walkable cell.

#### Scenario: Successful cardinal movement

- **WHEN** the player enters a different walkable cell using a cardinal step
- **THEN** world time SHALL increase by exactly one

#### Scenario: Successful diagonal movement

- **WHEN** the player enters a different walkable cell using a diagonal step
- **THEN** world time SHALL increase by exactly one

#### Scenario: Blocked movement

- **WHEN** the player attempts to move into a wall, outside the world, or any
  other non-walkable destination
- **THEN** world time SHALL remain unchanged

### Requirement: World time is displayed in the upper-left corner
The UI SHALL display the label `Time:` inside the upper-right Minimap box and SHALL render the current world time as a four-digit, zero-padded number for values below `10000`. The time value SHALL continue to reflect the active world-time system and SHALL update after successful movement.

#### Scenario: Initial minimap-box time display
- **WHEN** a new game view is shown with world time `1`
- **THEN** the Minimap box displays `Time: 0001`

#### Scenario: Initial time display
- **WHEN** a new game view is shown
- **THEN** the Minimap box displays `Time: 0001`

#### Scenario: Updated minimap-box time display
- **WHEN** world time advances
- **THEN** the `Time:` value inside the Minimap box updates to the current four-digit zero-padded value

#### Scenario: Updated time display
- **WHEN** world time advances
- **THEN** the UI updates to the new four-digit zero-padded value inside the Minimap box

#### Scenario: Values beyond four digits
- **WHEN** world time reaches a value greater than `9999`
- **THEN** the UI displays the complete numeric value without truncation

#### Scenario: Values beyond five digits
- **WHEN** world time reaches a value greater than `99999`
- **THEN** the Minimap box displays the complete numeric value without truncation

### Requirement: World-time advances broadcast deterministic ticks

Each world-time advance SHALL publish the new integer time to every currently registered tickable entity exactly once in deterministic registration order. Tick delivery SHALL include entities outside the active realm and visible region. An entity removed during a tick SHALL receive no future ticks, and an entity registered during a tick SHALL begin receiving ticks on the next world-time advance.

#### Scenario: All registered entities receive a tick
- **WHEN** world time advances from 7 to 8 with tickable characters, NPCs, enemies, and spawners registered across both realms
- **THEN** each registered entity SHALL receive time 8 exactly once in deterministic order

#### Scenario: Removed entity stops ticking
- **WHEN** an enemy or spawner is destroyed and unregistered at time 12
- **THEN** it SHALL receive no tick for time 13 or any later time

#### Scenario: New entity begins on the next advance
- **WHEN** a spawner creates an enemy while processing time 31
- **THEN** the enemy SHALL be born at time 31 and SHALL first receive a normal broadcast tick when time advances to 32

### Requirement: Time-consuming collision attacks advance time

A valid player attack caused by attempted movement into an enemy or spawner SHALL advance world time by exactly one even though the player remains in its cell. Attempts against an already removed target or other blocked movement SHALL not advance time.

#### Scenario: Player attack advances time
- **WHEN** the player attempts to move into a living adjacent enemy or spawner and deals damage
- **THEN** world time SHALL increase by exactly one and the resulting tick SHALL be broadcast
