# Spec Delta

## MODIFIED Requirements

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
- **THEN** its rendered `🕷️` presentation SHALL face that horizontal travel direction until a later left or right move changes it

#### Scenario: Vertical travel preserves enemy facing
- **WHEN** an enemy successfully moves up or down
- **THEN** its rendered `🕷️` presentation SHALL keep the last horizontal travel direction

#### Scenario: Enemy has no cross-realm target
- **WHEN** an Underground enemy is eligible while the player is in Overground
- **THEN** the enemy SHALL process the tick but remain in its current cell

#### Scenario: Occupied route preserves exclusive cells
- **WHEN** the next path cell is occupied and no equally suitable free step is available
- **THEN** the enemy SHALL remain in place and no two characters SHALL share a cell
