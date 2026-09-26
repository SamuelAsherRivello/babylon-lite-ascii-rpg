# npc-spawner-system Specification

## Purpose
Defines friendly Overground NPC spawning and patrol behavior that adds ambient movement without introducing combat, interaction, or a new world-time source.

## Requirements

### Requirement: Overground NPC-spawner distribution

The NPC Spawner System SHALL place normal NPC spawners only in the Overground realm. The selected NPC generation density SHALL create exactly 4 (Low), 8 (Med), or 12 (High) deterministic placements. Each accepted spawner cell SHALL be walkable and unoccupied by the player start, static objects, civilization features, characters, and other generated spawners. At least one accepted spawner cell SHALL be within 50 cardinal path cells of the player start.

#### Scenario: Overground NPC spawners reproduce
- **WHEN** two Overground realms use identical generation inputs
- **THEN** their matching selected-density NPC-spawner cells SHALL match exactly, and at least one SHALL be within 50 cardinal path cells of the player start

#### Scenario: Underground has no NPC spawners
- **WHEN** an Underground realm completes generation
- **THEN** the NPC Spawner System SHALL place no NPC spawners there

### Requirement: Friendly NPC spawning

Each NPC spawner SHALL create at most one NPC during world setup and SHALL never attempt another NPC spawn. Each NPC SHALL be placed on a walkable, unoccupied cell near its originating spawner. If no valid nearby cell exists during setup, that spawner SHALL remain empty and SHALL not create a deferred-spawn backlog.

#### Scenario: Spawner creates its initial NPC
- **WHEN** an NPC spawner is initialized in an Overground world
- **THEN** exactly one NPC SHALL be created on a valid nearby walkable cell

#### Scenario: Spawner never repeats
- **WHEN** an NPC spawner receives existing world-time ticks after its setup spawn attempt
- **THEN** it SHALL create no additional NPCs

### Requirement: Friendly NPC patrols

Each NPC SHALL retain its initial cell as home. At birth, it SHALL randomly select exactly one reachable destination whose cardinal path distance from home is either 15 or 20 cells and store its complete cardinal route. On each received existing tick, it SHALL attempt one stored route step using only walkable cells. After reaching the selected destination, it SHALL return one stored route step per received tick in reverse order. It SHALL not pathfind or randomize after birth.

#### Scenario: NPC chooses a bounded reachable destination at birth
- **WHEN** an NPC is born with reachable candidate cells at both allowed distances
- **THEN** it SHALL select one destination at path distance 15 or 20 from home

#### Scenario: NPC returns over its stored route
- **WHEN** an NPC reaches its selected destination
- **THEN** it SHALL follow its stored cardinal route in reverse back to its home without pathfinding or randomizing

#### Scenario: NPC cannot enter blocked terrain
- **WHEN** the next route cell is non-walkable or currently occupied
- **THEN** the NPC SHALL remain in its current cell for that tick and SHALL not enter that cell

### Requirement: NPCs are non-combat occupants

NPCs SHALL use the `☺` glyph and share single-cell dynamic occupancy with the player, enemies, and spawners. An NPC SHALL not attack, take ordinary combat damage, award experience, consume player stamina, emit combat logs, or cause world time to advance. NPCs SHALL receive damage from Bomb blasts as specified by the Bomb capability and SHALL emit no ordinary combat log for that damage. A player and NPC SHALL never occupy the same cell, and NPC pathing SHALL not target or deliberately avoid the player.

#### Scenario: NPC and player meet at a next cell
- **WHEN** either the player or an NPC attempts to enter the other actor's occupied cell
- **THEN** the attempted movement SHALL remain blocked and neither actor SHALL receive damage

#### Scenario: NPC takes no ordinary combat damage
- **WHEN** an ordinary non-bomb combat action targets an NPC
- **THEN** the NPC SHALL retain its health and remain in occupancy

### Requirement: NPCs and NPC spawners have health for bomb damage

Each NPC and NPC spawner SHALL start with `100` current health and `100` maximum health. A Bomb blast SHALL apply up to `100` damage to the reached NPC or NPC spawner, clamped to current health. At zero health, an NPC SHALL be removed from occupancy and unregistered from future ticks; an NPC spawner SHALL be removed from occupancy. Destroying an NPC spawner SHALL NOT remove the NPC it previously created.

#### Scenario: NPC starts at full health
- **WHEN** an NPC is created by its spawner
- **THEN** the NPC SHALL report `100 / 100` health

#### Scenario: NPC spawner starts at full health
- **WHEN** an NPC spawner is created
- **THEN** the spawner SHALL report `100 / 100` health

#### Scenario: Bomb damage kills NPC
- **WHEN** a `100`-damage Bomb blast reaches an NPC at `100 / 100` health
- **THEN** the NPC SHALL reach zero health, be removed from occupancy, and receive no future ticks

#### Scenario: Bomb damage destroys NPC spawner
- **WHEN** a `100`-damage Bomb blast reaches an NPC spawner at `100 / 100` health
- **THEN** the spawner SHALL reach zero health and be removed from occupancy while its previously created NPC remains unless that NPC is also reached

### Requirement: Portable follow behavior

The game SHALL provide a reusable follow behavior that accepts a follower, a target, movement and occupancy adapters, and optional navigation-transition resolution. The behavior SHALL not depend on NPC-specific state or player-specific code. It SHALL replan when the target moves, changes facing, or changes navigable region, and SHALL move at most one legal step per update.

#### Scenario: Any actor follows a target
- **WHEN** a consumer supplies a follower, target, walkability, occupancy, and navigation adapters
- **THEN** the behavior SHALL move the follower toward a valid target-relative position without requiring the follower or target to be an NPC or player

#### Scenario: Group followers prefer separation
- **WHEN** two or more followers use the same follow behavior and multiple legal target-relative cells are available
- **THEN** the behavior SHALL prefer positions that leave at least one empty grid cell between followers when possible

#### Scenario: Group spacing is constrained
- **WHEN** terrain, occupancy, a building transition, or the target-distance range prevents one-cell separation
- **THEN** the behavior SHALL choose the best legal non-overlapping position and SHALL not fail solely because preferred spacing is unavailable

### Requirement: Recruited NPC party following

After a living NPC joins the player's party, it SHALL follow the living player and SHALL target a walkable, unoccupied cell 3, 4, or 5 cardinal units behind the player. The preferred target SHALL be selected relative to the player's current facing when possible; if terrain or occupancy blocks it, the NPC SHALL choose another valid cell in that distance range. When the NPC is more than 5 cardinal gridspots from the player, it SHALL attempt one legal movement step on every game/render frame until it returns to the 3–5-gridspot range. The NPC SHALL never occupy the player's cell or abandon the 3–5-unit range merely because its preferred target is blocked.

#### Scenario: Recruited NPC follows a moving player
- **WHEN** the player moves far enough from a recruited living NPC
- **THEN** the NPC SHALL attempt a legal movement step every game/render frame toward a valid trailing cell and eventually remain 3–5 cardinal units behind the player

#### Scenario: Recruited NPC does not move while within range
- **WHEN** a recruited living NPC is 3, 4, or 5 cardinal gridspots from the player
- **THEN** the NPC SHALL not advance toward the player solely because a frame was rendered

#### Scenario: Recruited NPC follows the player's facing
- **WHEN** the player changes facing while a recruited NPC needs a new target
- **THEN** the NPC SHALL prefer a valid trailing cell on the side opposite the player's facing

#### Scenario: Blocked preferred trailing cell
- **WHEN** the preferred trailing cell is non-walkable or dynamically occupied
- **THEN** the NPC SHALL select another walkable, unoccupied cell 3–5 cardinal units from the player, or remain in place until one becomes available

#### Scenario: Recruited NPC does not patrol independently
- **WHEN** an NPC has joined the player's party
- **THEN** it SHALL stop its ambient patrol route and SHALL use the player's position as its movement target while remaining subject to existing tick cadence and occupancy rules

### Requirement: Follow behavior crosses building doors

When the target and follower are on opposite sides of an unlocked or open building door, the follow behavior SHALL resolve that door as an intermediate navigation target. It SHALL reach the door before crossing it, then replan toward the target. It SHALL support both outside-to-inside and inside-to-outside movement, and SHALL wait and retry when the door cannot currently be traversed.

#### Scenario: Follower enters a building after the target
- **WHEN** the player is inside a building and the recruited NPC is outside
- **THEN** the follow behavior SHALL target the player's building door, move the NPC to that door, cross it when permitted, and then target the player inside

#### Scenario: Follower exits a building after the target
- **WHEN** the player is outside a building and the recruited NPC is inside
- **THEN** the follow behavior SHALL target the same building door, move the NPC to that door, cross it when permitted, and then target the player outside

#### Scenario: Building door is unavailable
- **WHEN** the required building door is locked, blocked, or otherwise not traversable
- **THEN** the follow behavior SHALL not enter walls or overlap actors and SHALL retain a retryable transition target

### Requirement: Recruited NPCs persist through stair realm transitions

When the player enters stairs and the next realm loads, every living NPC currently in the player's party SHALL remain a party NPC rather than being discarded or regenerated as an unrelated ambient NPC. The transition SHALL preserve each party NPC's identity and recruited state, and SHALL place it in the newly loaded realm before normal follow updates resume.

#### Scenario: Party NPC crosses stairs with the player
- **WHEN** the player enters stairs while one or more living NPCs are in the party
- **THEN** the same party NPC instances SHALL be available in the newly loaded realm with their recruited state intact

#### Scenario: Unrecruited NPCs do not cross stairs as party members
- **WHEN** the player enters stairs with ambient NPCs that have not joined the party
- **THEN** those ambient NPCs SHALL not be carried across as party members by this requirement

### Requirement: Party NPCs receive stairs-adjacent placement in the new realm

After a stair transition loads the next realm, each preserved living party NPC SHALL be placed on a walkable, unoccupied cell nearest to the arrival stairs, prioritizing cells whose cardinal distance from the player is 3, 4, or 5 gridspots when such cells exist. Placement SHALL exclude blocked candidates and reserve each selected cell before placing the next party NPC. If no stairs-nearby cell in that distance band is available, the NPC SHALL use the nearest safe walkable, unoccupied fallback without overlapping the player or another actor, and SHALL resume ordinary follow behavior when a valid cell becomes available.

#### Scenario: Party NPCs enter near the stairs
- **WHEN** the next realm finishes loading after a stair transition
- **THEN** every preserved living party NPC SHALL appear on a nearest-to-the-arrival-stairs valid cell, preferably at a 3–5-gridspot cardinal distance from the player, before follow behavior resumes

#### Scenario: Stairs-near placement respects walkability and occupancy
- **WHEN** one or more nearest-to-stairs candidate cells are blocked by terrain or another entity
- **THEN** the transition placement SHALL exclude those cells and SHALL select the next-nearest valid candidate when one exists

#### Scenario: Multiple party NPCs receive distinct cells
- **WHEN** more than one living party NPC crosses the stairs
- **THEN** each NPC SHALL receive its own unoccupied valid cell and no party NPC SHALL overlap the player or another party NPC
