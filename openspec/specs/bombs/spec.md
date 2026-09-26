# bombs Specification

## Purpose

Provides a stackable, timed explosive that players can plant on the grid to clear diggable terrain and threaten nearby characters. The bomb capability integrates with inventory selection and advances only with deterministic world-time ticks.

## Requirements

### Requirement: New sessions start with a bomb stack

Each new gameplay session SHALL initialize the character's fourth inventory slot with a stack of 50 bombs. The bomb stack SHALL be authoritative game-layer character state and SHALL be published with the character snapshot. A depleted stack SHALL remain represented with a count of zero and SHALL not permit placement.

#### Scenario: Starting bomb count
- **WHEN** a new gameplay session initializes its character state
- **THEN** the fourth inventory slot SHALL contain 50 bombs

#### Scenario: Depleted stack cannot be used
- **WHEN** the bomb stack count is zero and the player requests bomb placement
- **THEN** no bomb SHALL be planted and the count SHALL remain zero

### Requirement: SPACE places a bomb from the selected inventory capability

When gameplay input is available, a non-repeating SPACE key press SHALL request the `bomb` capability through the existing inventory action-resolution system. If the character has at least one bomb, a cardinal heading location exists, and no planted bomb already occupies that heading location, the game SHALL plant one bomb at the heading location and decrement the stack by exactly one. The heading location SHALL be the grid cell immediately in front of the player's most recent successful cardinal movement, never the player's current cell. Failed placement SHALL not consume a bomb. A planted bomb SHALL not claim exclusive character occupancy or block actor movement. A planted bomb SHALL render with the `💣` glyph and remain at its planted cell after the player leaves; when its existing timed explosion begins, the existing `✶` blast glyph SHALL replace it at that cell.

#### Scenario: Place bomb at the current cell

- **WHEN** the player successfully moves right and then presses SPACE with a positive bomb count and no bomb at the cell immediately right of the player
- **THEN** one bomb SHALL appear one cell right of the player, no bomb SHALL appear at the player's current cell, and the bomb count SHALL decrease by one

#### Scenario: Cardinal headings select their adjacent cells

- **WHEN** the player has most recently moved up, down, left, or right and requests bomb placement
- **THEN** the bomb target SHALL be respectively the immediately adjacent north, south, west, or east grid cell

#### Scenario: Placement without a cardinal heading fails

- **WHEN** the player presses SPACE before any successful cardinal movement or after a diagonal movement with no prior cardinal heading
- **THEN** no bomb SHALL be planted, world time SHALL remain unchanged, and the bomb count SHALL remain unchanged

#### Scenario: SPACE repeat does not place extra bombs

- **WHEN** SPACE is held and the browser emits repeated keydown events
- **THEN** only the initial key press SHALL request bomb placement

#### Scenario: Occupied bomb cell rejects placement

- **WHEN** the player presses SPACE while a planted bomb already occupies the heading location
- **THEN** no additional bomb SHALL be planted and the bomb count SHALL remain unchanged

#### Scenario: Actor can move over a planted bomb

- **WHEN** a player or another actor enters a planted bomb's cell before detonation
- **THEN** actor occupancy and movement SHALL remain valid and the bomb SHALL remain planted

#### Scenario: Detonation replaces the bomb glyph

- **WHEN** a planted `💣` reaches the existing timed detonation tick
- **THEN** the bomb cell SHALL render the existing `✶` blast glyph for the active explosion

### Requirement: Bomb fuse and explosion advance on world-time ticks

A successful SPACE placement SHALL advance world time by exactly one. A planted bomb SHALL begin its five-tick fuse at the world time resulting from that placement action; the placement action tick SHALL not reduce the fuse. The bomb SHALL begin exploding on the fifth subsequent world-time tick. The explosion SHALL remain active for five world-time ticks, starting at radius one and increasing its radius by one grid cell per tick until it reaches radius five. Fuses and explosions SHALL pause whenever world time does not advance. Every world-time tick SHALL update planted bombs in all realms, whether active or inactive. Bomb effects SHALL resolve before player, enemy, and NPC movement or actions for that tick. If a pre-action blast kills the player, the pending action SHALL not proceed; a blocked action SHALL not advance world time or bomb timers.

#### Scenario: Placement advances time before the five-tick fuse
- **WHEN** the player plants a bomb at world time 10
- **THEN** world time SHALL advance to 11, the fuse SHALL start at time 11, and the bomb SHALL begin its radius-one explosion at time 16 after five additional ticks

#### Scenario: Failed placement does not advance time
- **WHEN** the player requests bomb placement with no bombs available or a bomb already on the current cell
- **THEN** world time SHALL remain unchanged

#### Scenario: Blast expands over five ticks
- **WHEN** a bomb begins exploding at radius one
- **THEN** its rendered influence SHALL expand through radii two, three, four, and five on the next four world-time ticks

#### Scenario: Fuse pauses without world-time advances
- **WHEN** a planted bomb exists and no action advances world time
- **THEN** its remaining fuse and blast radius SHALL remain unchanged

#### Scenario: Inactive-realm bomb keeps ticking
- **WHEN** world time advances while the player is in a realm other than the realm containing a planted bomb
- **THEN** the bomb SHALL advance its fuse or blast radius in its planted realm, and its effects SHALL apply only to that realm

#### Scenario: Blast resolves before actor movement
- **WHEN** a world-time tick is about to process player, enemy, or NPC movement and the expanding blast reaches that actor's cell
- **THEN** the blast SHALL resolve first and the actor SHALL not move or act after being killed

#### Scenario: Blast prevents pending player action
- **WHEN** a valid player action would advance world time but a pre-action blast kills the player
- **THEN** the pending movement or attack SHALL not proceed

### Requirement: Explosion affects cells in an expanding circular grid radius

At radius `r`, a bomb's blast SHALL include grid cells whose squared Euclidean distance from the bomb cell is no greater than `r * r`. On each tick, a blast SHALL apply damage throughout its entire currently active circle, including cells reached on earlier ticks; an actor entering an active cell SHALL therefore take damage on that tick. Terrain SHALL not shield cells from a blast. A health-bearing target in the active circle SHALL receive up to `100` bomb damage per tick, clamped to its current health. An interior Overground mountain SHALL receive that damage and, at zero health, become walkable standard Overground grass. An enemy or NPC spawner SHALL receive that damage and, at zero health, be removed from occupancy; a destroyed enemy spawner SHALL be unregistered and SHALL create no later enemies. Removing an NPC spawner SHALL not remove an NPC it already created. An enemy or NPC SHALL receive that damage and, at zero health, be removed from future simulation. A player in the active circle SHALL receive the bomb's `100` base damage through the existing Defense/Shield calculation, with Shield losing the final applied damage and player health losing that same amount. New-session player health SHALL be `125 / 125`, so one full `100`-damage hit cannot kill the player. Other entity types and non-diggable terrain SHALL not be affected. The blast SHALL render active cells with the `✶` glyph.

#### Scenario: Circular grid boundary
- **WHEN** an explosion expands from radius one to radius two
- **THEN** cells within the Euclidean radius-two circle, including diagonal cells newly reached at that radius, SHALL receive the radius-two blast effect

#### Scenario: Existing active cells remain damaging
- **WHEN** a player leaves a cell and re-enters it while that cell remains inside the active blast circle
- **THEN** the player SHALL receive bomb damage on the world-time tick when they re-enter

#### Scenario: Explosion damages and destroys diggable mountains
- **WHEN** an expanding blast reaches an interior Overground mountain
- **THEN** the mountain SHALL lose up to `100` health and SHALL immediately become walkable Overground grass when its health reaches zero

#### Scenario: Explosion damages and kills enemies and NPCs
- **WHEN** an expanding blast reaches an enemy or NPC
- **THEN** the character SHALL lose up to `100` health and, at zero health, SHALL be removed from occupancy and receive no future simulation ticks

#### Scenario: Player survives one blast hit at full health without Defense
- **WHEN** a player at `125 / 125` health with no Shield is reached by an expanding blast
- **THEN** player health SHALL decrease by `100` to `25` and the player SHALL remain alive

#### Scenario: Shield and Defense reduce player blast damage
- **WHEN** a player with full Defense and a Shield is reached by an expanding blast
- **THEN** player health SHALL decrease by `50`, Shield health SHALL decrease by `50`, and the player SHALL remain alive

#### Scenario: Repeated blast damage can kill the player
- **WHEN** a player receives bomb damage that reduces health to zero
- **THEN** the existing one-time player death transition SHALL occur

#### Scenario: Spawners take damage and are destroyed at zero health
- **WHEN** an expanding blast reaches an enemy spawner or NPC spawner
- **THEN** the spawner SHALL lose up to `100` health and, at zero health, SHALL be removed from occupancy and stop any future spawning

#### Scenario: Existing NPC survives destruction of its spawner
- **WHEN** a blast destroys an NPC spawner but does not reach the NPC it already created
- **THEN** the NPC SHALL remain alive and continue its normal behavior

#### Scenario: Other blocked terrain is unaffected
- **WHEN** a blast reaches an underground wall or Overground water
- **THEN** that terrain SHALL retain its existing state

### Requirement: Blast contact schedules a chained detonation

When an expanding blast first reaches a planted bomb, that bomb SHALL begin its own explosion on the next world-time tick, regardless of its remaining fuse. Repeated blast contact SHALL NOT schedule duplicate detonations for the same bomb.

#### Scenario: Chain reaction overrides remaining fuse
- **WHEN** a bomb with four fuse ticks remaining is reached by another bomb's blast at time 20
- **THEN** the reached bomb SHALL begin its radius-one explosion at time 21

#### Scenario: Multiple blast contacts schedule one chain
- **WHEN** multiple blast effects reach the same planted bomb before its scheduled chain tick
- **THEN** that bomb SHALL detonate once on the next world-time tick
