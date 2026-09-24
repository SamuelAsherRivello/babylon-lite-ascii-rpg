# Spec Delta

## ADDED Requirements

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
