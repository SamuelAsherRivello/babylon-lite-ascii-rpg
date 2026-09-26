# Spec Delta

## MODIFIED Requirements

### Requirement: Enemy identity, birth, and age

Each enemy SHALL have Spider as its sole enemy presentation identity, record the world time at which it is born, start with `40` health, default to left-facing presentation, and calculate age as `currentWorldTime - bornAtTime`. An enemy SHALL take no movement or attack action before age `2`, then SHALL become eligible for one action whenever its age is an even positive value.

#### Scenario: Enemy waits until age two
- **WHEN** an enemy is born at time `7` and processes times `8` and `9`
- **THEN** it SHALL take no action at time 8 and SHALL take its first eligible action at time 9

#### Scenario: Later actions use age cadence
- **WHEN** that enemy remains alive through times `11` and `13`
- **THEN** it SHALL be eligible for one action at each time because its ages are 4 and 6

#### Scenario: Enemy starts left-facing
- **WHEN** an enemy is born
- **THEN** its Spider presentation SHALL use left-facing orientation until it next travels horizontally

### Requirement: Same-realm pursuit and cross-realm idling

On an eligible action, an enemy with a living player in the same realm SHALL take at most one deterministic cardinal step toward the player while respecting terrain and occupied cells. When the player is distant, the enemy SHALL follow a reachable deterministic coarse-sector route toward the player's sector and SHALL refine to a shortest available cardinal path in the local refinement area. An enemy whose player target is in another realm SHALL remain in place for that action.

#### Scenario: Enemy advances toward same-realm player
- **WHEN** an eligible enemy has a traversable cardinal path to a living player in the same realm
- **THEN** it SHALL move one free cardinal cell along the applicable deterministic route toward the player

#### Scenario: Distant enemy routes around a barrier
- **WHEN** an eligible enemy and same-realm player are in separate navigation sectors and direct Manhattan movement is blocked by terrain
- **THEN** the enemy SHALL move toward a reachable sector exit on its deterministic coarse route rather than attempt the blocked direct direction

#### Scenario: Horizontal travel updates enemy facing
- **WHEN** an enemy successfully moves left or right
- **THEN** its Spider presentation SHALL face that horizontal travel direction until a later left or right move changes it

#### Scenario: Vertical travel preserves enemy facing
- **WHEN** an enemy successfully moves up or down
- **THEN** its Spider presentation SHALL keep the last horizontal travel direction

#### Scenario: Enemy has no cross-realm target
- **WHEN** an Underground enemy is eligible while the player is in Overground
- **THEN** the enemy SHALL process the tick but remain in its current cell

#### Scenario: Occupied route preserves exclusive cells
- **WHEN** the next path cell is occupied and no equally suitable free step is available
- **THEN** the enemy SHALL remain in place and no two characters SHALL share a cell

### Requirement: Player attack and enemy death

An attempted player movement into a cardinally or diagonally adjacent enemy SHALL attack instead of moving. The attack SHALL deal the player's base `20` enemy health damage, leave both entities in their cells, consume one world-time unit, and emit one damage event. At zero health, the enemy SHALL be removed from occupancy, emit one death event, unregister from future ticks, and never act again; its visual death presentation SHALL follow the enemy-sprite-presentation capability.

#### Scenario: Player damages an enemy
- **WHEN** the player attempts to move into a living enemy cell
- **THEN** the enemy SHALL lose 20 health, neither entity SHALL move, and world time SHALL advance by one

#### Scenario: Enemy dies at zero health
- **WHEN** player damage reduces an enemy's health to zero
- **THEN** the enemy SHALL be removed from occupancy, emit one death event, unregister from future ticks, take no later action, and begin its visual death presentation
