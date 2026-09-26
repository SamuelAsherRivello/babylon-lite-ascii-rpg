# Spec Delta

## MODIFIED Requirements

### Requirement: Friendly NPC patrols

Each ambient NPC SHALL retain its randomly selected initial endpoint and originating spawner as its patrol anchors. At birth, it SHALL store the complete cardinal route from that endpoint toward the spawner, terminating at the closest valid unoccupied approach cell because the spawner occupies its own cell. On each eligible existing tick, it SHALL attempt one stored route step using only walkable cells, proceeding from its initial endpoint toward its spawner approach. An ambient NPC is eligible only when the living player is in the same realm and its cardinal grid distance from that player is `50` or less; otherwise it SHALL remain in its current cell and create no patrol work. After reaching that approach, it SHALL traverse the same stored route in reverse back to the initial endpoint; after reaching the endpoint, it SHALL repeat this outbound-and-return cycle on later eligible ticks. It SHALL not pathfind or randomize after birth.

#### Scenario: NPC chooses a bounded reachable destination at birth

- **WHEN** an NPC is born from a spawner with qualifying patrol endpoints
- **THEN** it SHALL begin at its selected endpoint 10 through 15 cardinal path cells from the spawner and store a route toward that spawner

#### Scenario: Distant ambient NPC sleeps

- **WHEN** an ambient NPC is in another realm or more than 50 cardinal grid cells from the living player when world time advances
- **THEN** it remains in its current cell and receives no patrol delivery or deferred patrol work for that advance

#### Scenario: NPC returns over its stored route

- **WHEN** an eligible ambient NPC reaches the valid approach to its originating spawner
- **THEN** it SHALL follow its stored cardinal route in reverse back to the initial endpoint without pathfinding or randomizing

#### Scenario: NPC repeats its default patrol

- **WHEN** an eligible ambient NPC returns to its initial endpoint after visiting the approach to its originating spawner
- **THEN** it SHALL resume the stored route toward that spawner on its next eligible default-patrol tick

#### Scenario: NPC cannot enter blocked terrain

- **WHEN** an eligible ambient NPC's next route cell is non-walkable or currently occupied
- **THEN** the NPC SHALL remain in its current cell for that tick and SHALL not enter that cell

### Requirement: Recruited NPC party following

After a living NPC joins the player's party, it SHALL follow the living player and SHALL target a walkable, unoccupied cell 3, 4, or 5 cardinal units behind the player. The preferred target SHALL be selected relative to the player's current facing when possible; if terrain or occupancy blocks it, the NPC SHALL choose another valid cell in that distance range. When the NPC is more than 5 cardinal gridspots from the player, it SHALL attempt one legal movement step on every game/render frame until it returns to the 3–5-gridspot range, regardless of ambient-character tick eligibility. The NPC SHALL never occupy the player's cell or abandon the 3–5-unit range merely because its preferred target is blocked.

#### Scenario: Recruited NPC follows a moving player

- **WHEN** the player moves far enough from a recruited living NPC
- **THEN** the NPC SHALL attempt a legal movement step every game/render frame toward a valid trailing cell and eventually remain 3–5 cardinal units behind the player

#### Scenario: Recruited NPC does not move while within range

- **WHEN** a recruited living NPC is 3, 4, or 5 cardinal gridspots from the player
- **THEN** the NPC SHALL not advance toward the player solely because a frame was rendered

#### Scenario: Recruited NPC ignores ambient sleep

- **WHEN** a recruited living NPC needs a frame-based follow update while its ambient-character tick eligibility would otherwise be false
- **THEN** it SHALL retain its established frame-based follow behavior and SHALL not be frozen by ambient patrol sleep

#### Scenario: Recruited NPC follows the player's facing

- **WHEN** the player changes facing while a recruited NPC needs a new target
- **THEN** the NPC SHALL prefer a valid trailing cell on the side opposite the player's facing

#### Scenario: Blocked preferred trailing cell

- **WHEN** the preferred trailing cell is non-walkable or dynamically occupied
- **THEN** the NPC SHALL select another walkable, unoccupied cell 3–5 cardinal units from the player, or remain in place until one becomes available

#### Scenario: Recruited NPC does not patrol independently

- **WHEN** an NPC has joined the player's party
- **THEN** it SHALL stop its ambient patrol route and SHALL use the player's position as its movement target while remaining subject to existing tick cadence and occupancy rules
