# Spec Delta

## MODIFIED Requirements

### Requirement: Same-realm pursuit and cross-realm idling

On an eligible action, an enemy with a living player in the same realm SHALL consider the living player and every living NPC in that realm as valid targets. It SHALL choose the target with the shortest reachable cardinal path distance from its current cell, breaking equal-distance ties in favor of the player and then by stable actor identifier. It SHALL take at most one deterministic cardinal step toward the selected target while respecting terrain and occupied cells. When no NPC or player target is reachable, it SHALL remain in place. An enemy whose player and NPC targets are in another realm SHALL remain in place for that action.

#### Scenario: Enemy pursues the nearest NPC
- **WHEN** an eligible enemy has a reachable NPC closer than the player in the same realm
- **THEN** it SHALL move one free cardinal cell along the deterministic route toward that NPC

#### Scenario: Enemy advances toward same-realm player
- **WHEN** an eligible enemy has a traversable cardinal path to a living player in the same realm
- **THEN** it SHALL move one free cardinal cell along the applicable deterministic route toward the player

#### Scenario: Enemy pursues the player when the player is nearer
- **WHEN** an eligible enemy has a reachable player closer than every living NPC in the same realm
- **THEN** it SHALL move one free cardinal cell along the deterministic route toward the player

#### Scenario: Distant enemy routes around a barrier
- **WHEN** an eligible enemy and selected same-realm target are in separate navigation sectors and direct Manhattan movement is blocked by terrain
- **THEN** it SHALL move toward a reachable sector exit on its deterministic coarse route rather than attempt the blocked direct direction

#### Scenario: Horizontal travel updates enemy facing
- **WHEN** an enemy successfully moves left or right
- **THEN** its rendered `🕷️` presentation SHALL face that horizontal travel direction until a later left or right move changes it

#### Scenario: Vertical travel preserves enemy facing
- **WHEN** an enemy successfully moves up or down
- **THEN** its rendered `🕷️` presentation SHALL keep the last horizontal travel direction

#### Scenario: Enemy has no cross-realm target
- **WHEN** an Underground enemy is eligible while the player and all NPCs are in Overground
- **THEN** the enemy SHALL process the tick but remain in its current cell

#### Scenario: Occupied route preserves exclusive cells
- **WHEN** the next path cell is occupied and no equally suitable free step is available
- **THEN** the enemy SHALL remain in place and no two characters SHALL share a cell

#### Scenario: Enemy uses deterministic tie-breaking
- **WHEN** the player and an NPC are reachable at equal path distance
- **THEN** the enemy SHALL select the player, and equal-priority NPC targets SHALL be ordered by stable identifier

#### Scenario: Enemy ignores dead NPCs
- **WHEN** an NPC has reached zero health
- **THEN** it SHALL not be selected as an enemy pursuit target

#### Scenario: Enemy has no reachable target
- **WHEN** all same-realm player and NPC targets are unreachable or absent
- **THEN** the enemy SHALL process the tick but remain in its current cell

### Requirement: Enemy attack collision

When an eligible enemy is cardinally adjacent to its selected living target, its attempted step into that target cell SHALL attack instead of moving. The attack SHALL deal exactly `5` health damage to either the player or NPC target, leave all entities in their cells, and emit one target-specific damage event through the Log System. The existing player-death transition SHALL occur when the player reaches zero health. An NPC SHALL be removed from occupancy and future ticks when the attack reduces its health to zero.

#### Scenario: Adjacent enemy attacks an NPC
- **WHEN** an eligible enemy is cardinally adjacent to the selected living NPC
- **THEN** the NPC SHALL lose 5 health, neither entity SHALL move, and one enemy-NPC attack log event SHALL be submitted

#### Scenario: Adjacent enemy attacks
- **WHEN** an eligible enemy attempts to enter the cardinally adjacent selected player cell
- **THEN** the player SHALL lose 5 health, neither entity SHALL move, and one enemy-player attack log event SHALL be submitted

#### Scenario: Adjacent enemy attacks the player
- **WHEN** an eligible enemy is cardinally adjacent to the selected living player
- **THEN** the player SHALL lose 5 health, neither entity SHALL move, and one enemy-player attack log event SHALL be submitted

#### Scenario: Enemy attack kills an NPC
- **WHEN** an enemy attack reduces an NPC's health to zero
- **THEN** the NPC SHALL disappear, unregister from future ticks, and never act or become a target again

#### Scenario: Enemy attack kills the player
- **WHEN** an enemy attack reduces player health to zero
- **THEN** the existing authoritative player-death transition SHALL occur exactly once
