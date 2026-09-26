# Spec Delta

## MODIFIED Requirements

### Requirement: Friendly NPC spawning

Each NPC spawner SHALL create at most one NPC during world setup and SHALL never attempt another NPC spawn. During that setup attempt, the spawner SHALL randomly select one reachable, walkable, unoccupied patrol endpoint whose cardinal path distance from its cell is at least 10 and at most 15 cells. It SHALL create its NPC at the selected endpoint only when it can also establish the complete route toward the spawner. If no qualifying endpoint and route exist during setup, that spawner SHALL remain empty and SHALL not create a deferred-spawn backlog.

#### Scenario: Spawner creates its initial NPC
- **WHEN** an NPC spawner is initialized in an Overground world with qualifying patrol endpoints
- **THEN** exactly one NPC SHALL be created on a reachable, walkable, unoccupied endpoint whose cardinal path distance from that spawner is 10 through 15 cells inclusive

#### Scenario: Spawner rejects a nearby-only spawn
- **WHEN** an NPC spawner has walkable unoccupied cells near it but no reachable endpoint 10 through 15 cardinal path cells away
- **THEN** it SHALL remain empty and create no NPC

#### Scenario: Spawner never repeats
- **WHEN** an NPC spawner receives existing world-time ticks after its setup spawn attempt
- **THEN** it SHALL create no additional NPCs

### Requirement: Friendly NPC patrols

Each NPC SHALL retain its randomly selected initial endpoint and originating spawner as its patrol anchors. At birth, it SHALL store the complete cardinal route from that endpoint toward the spawner, terminating at the closest valid unoccupied approach cell because the spawner occupies its own cell. On each received existing tick, it SHALL attempt one stored route step using only walkable cells, proceeding from its initial endpoint toward its spawner approach. After reaching that approach, it SHALL traverse the same stored route in reverse back to the initial endpoint; after reaching the endpoint, it SHALL repeat this outbound-and-return cycle forever for its default patrol. It SHALL not pathfind or randomize after birth.

#### Scenario: NPC chooses a bounded reachable destination at birth
- **WHEN** an NPC is born from a spawner with qualifying patrol endpoints
- **THEN** it SHALL begin at its selected endpoint 10 through 15 cardinal path cells from the spawner and store a route toward that spawner

#### Scenario: NPC returns over its stored route
- **WHEN** an NPC reaches the valid approach to its originating spawner
- **THEN** it SHALL follow its stored cardinal route in reverse back to its initial endpoint without pathfinding or randomizing

#### Scenario: NPC repeats its default patrol
- **WHEN** an NPC returns to its initial endpoint after visiting the approach to its originating spawner
- **THEN** it SHALL resume the stored route toward that spawner on its next default-patrol tick

#### Scenario: NPC cannot enter blocked terrain
- **WHEN** the next route cell is non-walkable or currently occupied
- **THEN** the NPC SHALL remain in its current cell for that tick and SHALL not enter that cell
