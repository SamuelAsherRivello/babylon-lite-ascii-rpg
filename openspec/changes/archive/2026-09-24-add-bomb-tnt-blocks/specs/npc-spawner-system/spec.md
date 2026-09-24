# Spec Delta

## MODIFIED Requirements

### Requirement: NPCs are non-combat occupants

NPCs SHALL use the `☺` glyph and share single-cell dynamic occupancy with the player, enemies, and spawners. An NPC SHALL not attack, take ordinary combat damage, award experience, consume player stamina, emit combat logs, or cause world time to advance. NPCs SHALL receive damage from Bomb blasts as specified by the Bomb capability and SHALL emit no ordinary combat log for that damage. A player and NPC SHALL never occupy the same cell, and NPC pathing SHALL not target or deliberately avoid the player.

#### Scenario: NPC and player meet at a next cell
- **WHEN** either the player or an NPC attempts to enter the other actor's occupied cell
- **THEN** the attempted movement SHALL remain blocked and neither actor SHALL receive damage

#### Scenario: NPC takes no ordinary combat damage
- **WHEN** an ordinary non-bomb combat action targets an NPC
- **THEN** the NPC SHALL retain its health and remain in occupancy

## ADDED Requirements

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
