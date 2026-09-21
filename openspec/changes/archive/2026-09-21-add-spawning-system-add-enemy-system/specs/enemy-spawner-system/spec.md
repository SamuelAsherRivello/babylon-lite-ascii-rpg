# Spec Delta

## Purpose

Defines deterministic Underground enemy-spawner placement, time-driven spawning, damage, destruction, and permanent shutdown behavior.

## ADDED Requirements

### Requirement: Underground-only deterministic spawner distribution

The Enemy Spawner System SHALL place spawners only in the Underground realm after existing object and civilization placement. It SHALL divide the generated world into coarse gameplay regions, place at most one valid spawner per selected region, cap normal distribution at `16`, and reproduce the same accepted cells for the same seed and generation inputs. Every accepted spawner cell SHALL be walkable and unoccupied by the player start, objects, civilization features, other spawners, or characters.

#### Scenario: Underground distribution is repeatable
- **WHEN** two Underground realms use the same seed, dimensions, terrain, objects, and civilization layout
- **THEN** their normal enemy spawner cells SHALL match and SHALL contain no more than 16 spawners

#### Scenario: Overground has no enemy spawners
- **WHEN** an Overground realm completes generation
- **THEN** the Enemy Spawner System SHALL place no spawners there

### Requirement: Development starting-area spawner

Local development and focused test configuration SHALL add one bonus Underground spawner on a valid cell whose Euclidean distance from the Underground player start is at most `5`. Production configuration SHALL omit this bonus spawner, and the bonus SHALL be independent of the normal 16-spawner cap.

#### Scenario: Development bonus is nearby
- **WHEN** the Underground realm is generated with the development bonus enabled
- **THEN** one additional valid spawner SHALL be placed with `Math.hypot(dx, dy) <= 5` from the player start

#### Scenario: Production omits development bonus
- **WHEN** the same realm is generated in production configuration
- **THEN** no development-only starting-area spawner SHALL be added

### Requirement: Spawner identity and lifecycle

Each spawner SHALL render as a palette-driven red `S`, be born at its creation time, start with `100` health, remain stationary, and have no attack behavior. A living spawner SHALL attempt one initial enemy spawn at world time `1` and one additional spawn every `30` time units thereafter.

#### Scenario: Initial spawn occurs at time one
- **WHEN** a living spawner processes world time `1`
- **THEN** it SHALL attempt to create exactly one enemy

#### Scenario: Repeating spawn cadence
- **WHEN** a living spawner processes times `31`, `61`, and `91`
- **THEN** it SHALL attempt exactly one new enemy at each listed time and none on intervening ticks

### Requirement: Spawn candidates preserve occupancy

A spawner SHALL select deterministically from the eight cells surrounding its own cell. An accepted destination SHALL be inside the world, walkable, and free of the player, objects, civilization blockers, spawners, and enemies. If no destination is valid, that spawn attempt SHALL create no enemy and SHALL NOT accumulate a deferred spawn backlog.

#### Scenario: Enemy uses a free neighboring cell
- **WHEN** at least one of a living spawner's eight neighboring cells is valid during a scheduled attempt
- **THEN** exactly one enemy SHALL be born on a deterministic valid neighboring cell

#### Scenario: Blocked spawn is skipped
- **WHEN** every neighboring cell is invalid or occupied during a scheduled attempt
- **THEN** no enemy SHALL be created and the next attempt SHALL remain on the ordinary 30-unit cadence

### Requirement: Spawner damage and permanent destruction

An attempted player movement into a cardinally or diagonally adjacent spawner SHALL deal the player's base `20` damage, leave the player and spawner in their current cells, consume one world-time unit, and emit damage through the Log System. At zero health, the spawner SHALL be removed from active occupancy, emit one death event, and permanently stop all future spawning.

#### Scenario: Player damages a spawner
- **WHEN** the player attempts to move into a living spawner cell
- **THEN** the spawner SHALL lose 20 health, neither entity SHALL move, and world time SHALL advance by one

#### Scenario: Destroyed spawner never resumes
- **WHEN** spawner damage reduces its health to zero
- **THEN** the spawner SHALL disappear, emit one death event, unregister from future ticks, and create no later enemies
