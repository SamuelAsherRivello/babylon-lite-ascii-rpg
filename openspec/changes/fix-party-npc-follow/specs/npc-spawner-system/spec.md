# Spec Delta

## ADDED Requirements

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
