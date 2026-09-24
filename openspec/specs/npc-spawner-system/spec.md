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

NPCs SHALL use the `☺` glyph and share single-cell dynamic occupancy with the player, enemies, and spawners. An NPC SHALL not attack, take damage, award experience, consume player stamina, emit combat or death logs, or cause world time to advance. A player and NPC SHALL never occupy the same cell, and NPC pathing SHALL not target or deliberately avoid the player.

#### Scenario: NPC and player meet at a next cell
- **WHEN** either the player or an NPC attempts to enter the other actor's occupied cell
- **THEN** the attempted movement SHALL remain blocked and neither actor SHALL receive damage
