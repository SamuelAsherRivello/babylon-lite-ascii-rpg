# Spec Delta

## MODIFIED Requirements

### Requirement: Spawner identity and lifecycle

Each spawner SHALL render as a palette-driven red `S`, be born at its creation time, start with `100` health, remain stationary, and have no attack behavior. A living spawner SHALL process an initial spawn decision at world time `1` and one additional spawn decision every `100` time units thereafter. Each spawner SHALL maintain a maximum of three living enemies that it has spawned; enemies owned by other spawners SHALL not count toward this limit.

#### Scenario: Initial spawn burst is bounded
- **WHEN** a living spawner processes world time `1` with no living enemies that it owns
- **THEN** it SHALL randomly attempt to create one, two, or three enemies and SHALL never create more than three

#### Scenario: Initial spawn occurs at time one
- **WHEN** a living spawner processes world time `1`
- **THEN** it SHALL make its initial bounded spawn decision at that time

#### Scenario: Recurring spawn decision uses the per-spawner population
- **WHEN** a living spawner processes a scheduled time exactly 100 world-time units after its prior decision
- **THEN** it SHALL inspect its owned living enemies and randomly attempt to create no more than the remaining capacity

#### Scenario: Repeating spawn cadence
- **WHEN** a living spawner processes a time 100 world-time units after its prior decision
- **THEN** it SHALL make one bounded burst decision and SHALL make no spawn decision on intervening ticks

#### Scenario: Full spawner creates nothing
- **WHEN** a living spawner has three owned living enemies at a scheduled spawn decision
- **THEN** it SHALL create no enemies

#### Scenario: Dead owned enemies free capacity
- **WHEN** one or more enemies owned by a spawner die before a later scheduled decision
- **THEN** those dead enemies SHALL no longer count toward the spawner's population limit

### Requirement: Spawn candidates preserve occupancy

A spawner SHALL select each requested enemy from the eight cells surrounding its own cell. Each accepted destination SHALL be inside the world, walkable, and free of the player, objects, civilization blockers, spawners, and enemies. A burst SHALL stop creating enemies when the requested amount has been attempted, the spawner reaches three living owned enemies, or no valid neighboring cell remains. If no destination is valid for an attempt, no enemy SHALL be created for that attempt and the next decision SHALL remain on the ordinary 100-unit cadence; failed attempts SHALL NOT accumulate a deferred spawn backlog.

#### Scenario: Burst fills only available capacity
- **WHEN** a spawner has one living owned enemy and its random decision requests two additional enemies
- **THEN** it SHALL attempt at most two additional spawns and SHALL finish with no more than three living owned enemies

#### Scenario: Enemy uses a free neighboring cell
- **WHEN** at least one of a living spawner's eight neighboring cells is valid during a scheduled burst
- **THEN** each successful enemy birth SHALL use a deterministic valid neighboring cell

#### Scenario: Blocked burst does not backlog
- **WHEN** a burst request cannot find a valid neighboring cell for one or more requested enemies
- **THEN** it SHALL create only the enemies that fit in currently valid cells and SHALL not retry the missed amount outside the next scheduled decision

#### Scenario: Blocked spawn is skipped
- **WHEN** every neighboring cell is invalid or occupied during a scheduled burst
- **THEN** no enemy SHALL be created and the next decision SHALL remain on the ordinary 100-unit cadence

#### Scenario: Other spawners have independent capacity
- **WHEN** one spawner has reached three living owned enemies while another spawner has remaining capacity
- **THEN** the full spawner SHALL remain quiet and the other spawner SHALL continue making its own independent spawn decisions
