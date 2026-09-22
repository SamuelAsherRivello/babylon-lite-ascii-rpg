# enemy-system Specification

## Purpose

Defines hostile enemy birth, aging, autonomous simulation, movement, collision combat, health, death, and realm-independent lifetime behavior.

## Requirements

### Requirement: Enemy identity, birth, and age

Each enemy SHALL render as a palette-driven red `🕷️`, record the world time at which it is born, start with `40` health, default to left-facing presentation, and calculate age as `currentWorldTime - bornAtTime`. An enemy SHALL take no movement or attack action before age `2`, then SHALL become eligible for one action whenever its age is an even positive value.

#### Scenario: Enemy waits until age two
- **WHEN** an enemy is born at time `7` and processes times `8` and `9`
- **THEN** it SHALL take no action at time 8 and SHALL take its first eligible action at time 9

#### Scenario: Later actions use age cadence
- **WHEN** that enemy remains alive through times `11` and `13`
- **THEN** it SHALL be eligible for one action at each time because its ages are 4 and 6

#### Scenario: Enemy starts left-facing
- **WHEN** an enemy is born
- **THEN** it SHALL render as `🕷️` using its left-facing presentation until it next travels horizontally

### Requirement: Every enemy simulates on every world tick

Every living enemy SHALL receive every world-time tick regardless of its realm, active-camera state, fog discovery, visibility, or onscreen status. Simulation and rendering SHALL remain independent: an offscreen enemy or an enemy in an inactive realm SHALL continue aging and processing behavior without being rendered.

#### Scenario: Inactive-realm enemy keeps living
- **WHEN** world time advances while the player views Overground and an enemy exists Underground
- **THEN** the Underground enemy SHALL receive the tick and update its age even though it is not rendered

### Requirement: Same-realm pursuit and cross-realm idling

On an eligible action, an enemy with a living player in the same realm SHALL take at most one deterministic cardinal step along a shortest available path toward the player while respecting terrain and occupied cells. An enemy whose player target is in another realm SHALL remain in place for that action.

#### Scenario: Enemy advances toward same-realm player
- **WHEN** an eligible enemy has a traversable cardinal path to a living player in the same realm
- **THEN** it SHALL move one free cardinal cell along a deterministic shortest path

#### Scenario: Horizontal travel updates enemy facing
- **WHEN** an enemy successfully moves left or right
- **THEN** its rendered `🕷️` presentation SHALL face that horizontal travel direction until a later left or right move changes it

#### Scenario: Vertical travel preserves enemy facing
- **WHEN** an enemy successfully moves up or down
- **THEN** its rendered `🕷️` presentation SHALL keep the last horizontal travel direction

#### Scenario: Enemy has no cross-realm target
- **WHEN** an Underground enemy is eligible while the player is in Overground
- **THEN** the enemy SHALL process the tick but remain in its current cell

#### Scenario: Occupied route preserves exclusive cells
- **WHEN** the next path cell is occupied and no equally short free step is available
- **THEN** the enemy SHALL remain in place and no two characters SHALL share a cell

### Requirement: Enemy attack collision

When an eligible enemy is cardinally adjacent to the living player, its attempted step into the player cell SHALL attack instead of moving. The attack SHALL deal exactly `5` player health damage, leave both entities in their cells, and emit one damage event through the Log System.

#### Scenario: Adjacent enemy attacks
- **WHEN** an eligible enemy attempts to enter the cardinally adjacent player cell
- **THEN** the player SHALL lose 5 health, neither entity SHALL move, and one enemy-attack log event SHALL be submitted

#### Scenario: Enemy attack kills the player
- **WHEN** an enemy attack reduces player health to zero
- **THEN** the existing authoritative player-death transition SHALL occur exactly once

### Requirement: Player attack and enemy death

An attempted player movement into a cardinally or diagonally adjacent enemy SHALL attack instead of moving. The attack SHALL deal the player's base `20` enemy health damage, leave both entities in their cells, consume one world-time unit, and emit one damage event. At zero health, the enemy SHALL be removed from occupancy, emit one death event, unregister from future ticks, and never act again.

#### Scenario: Player damages an enemy
- **WHEN** the player attempts to move into a living enemy cell
- **THEN** the enemy SHALL lose 20 health, neither entity SHALL move, and world time SHALL advance by one

#### Scenario: Enemy dies at zero health
- **WHEN** player damage reduces an enemy's health to zero
- **THEN** the enemy SHALL disappear, emit one death event, unregister from future ticks, and take no later action

### Requirement: Enemy population has no artificial count cap

Living spawners SHALL continue their configured spawn attempts without a global enemy-count cap. Population growth SHALL remain constrained by valid neighboring spawn cells, exclusive occupancy, spawner destruction, and enemy death.

#### Scenario: Multiple scheduled enemies remain active
- **WHEN** a spawner completes several successful scheduled attempts and the earlier enemies remain alive
- **THEN** every successfully spawned enemy SHALL remain independently active and tickable
