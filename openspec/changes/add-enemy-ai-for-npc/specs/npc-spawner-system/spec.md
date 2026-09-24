# Spec Delta

## MODIFIED Requirements

### Requirement: NPCs are non-combat occupants

NPCs SHALL use the `☺` glyph and share single-cell dynamic occupancy with the player, enemies, and spawners. NPCs SHALL not attack the player, award experience, consume player stamina, emit attack logs, or cause world time to advance. NPCs SHALL be valid damage targets for enemy attacks and Bomb blasts as specified by the Enemy and Bomb capabilities. A player and NPC SHALL never occupy the same cell, and NPC pathing SHALL retain its existing follow or patrol behavior without targeting the player as an attack action.

#### Scenario: NPC follows without attacking the player
- **WHEN** a living NPC receives its normal follow or patrol update while the player is nearby
- **THEN** it SHALL retain its existing movement behavior and SHALL not damage the player or advance world time by attacking

#### Scenario: Enemy damages NPC
- **WHEN** an enemy attack targets a living NPC
- **THEN** the NPC SHALL lose the enemy's applied damage while remaining in its occupied cell

#### Scenario: NPC and player meet at a next cell
- **WHEN** either the player or an NPC attempts to enter the other actor's occupied cell
- **THEN** the attempted movement SHALL remain blocked and neither actor SHALL receive damage from that movement attempt

#### Scenario: NPC takes no ordinary combat damage
- **WHEN** an ordinary non-enemy, non-bomb combat action targets an NPC
- **THEN** the NPC SHALL retain its health and remain in occupancy

### Requirement: NPCs and NPC spawners have health for bomb damage

Each NPC and NPC spawner SHALL start with `100` current health and `100` maximum health. Enemy and Bomb damage SHALL apply to a reached NPC, clamped to current health. At zero health, an NPC SHALL be removed from occupancy and unregistered from future ticks; an NPC spawner SHALL be removed from occupancy. Destroying an NPC spawner SHALL NOT remove the NPC it previously created.

#### Scenario: NPC starts at full health
- **WHEN** an NPC is created by its spawner
- **THEN** the NPC SHALL report `100 / 100` health

#### Scenario: NPC spawner starts at full health
- **WHEN** an NPC spawner is created
- **THEN** the spawner SHALL report `100 / 100` health

#### Scenario: Enemy damage kills NPC
- **WHEN** a `5`-damage enemy attack reaches an NPC with `5` health remaining
- **THEN** the NPC SHALL reach zero health, be removed from occupancy, and receive no future ticks

#### Scenario: Bomb damage kills NPC
- **WHEN** a `100`-damage Bomb blast reaches an NPC at `100 / 100` health
- **THEN** the NPC SHALL reach zero health, be removed from occupancy, and receive no future ticks

#### Scenario: Bomb damage destroys NPC spawner
- **WHEN** a `100`-damage Bomb blast reaches an NPC spawner at `100 / 100` health
- **THEN** the spawner SHALL reach zero health and be removed from occupancy while its previously created NPC remains unless that NPC is also reached
