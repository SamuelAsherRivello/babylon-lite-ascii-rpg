# Spec Delta

## MODIFIED Requirements

### Requirement: SPACE places a bomb from the selected inventory capability

When gameplay input is available, a non-repeating SPACE key press SHALL request the `bomb` capability through the existing inventory action-resolution system. If the character has at least one bomb, a cardinal heading location exists, and no planted bomb already occupies that heading location, the game SHALL plant one bomb at the heading location and decrement the stack by exactly one. The heading location SHALL be the grid cell immediately in front of the player's most recent successful cardinal movement, never the player's current cell. Failed placement SHALL not consume a bomb. A planted bomb SHALL not claim exclusive character occupancy or block actor movement. A planted bomb SHALL render with the `💣` glyph and remain at its planted cell after the player leaves. During its fuse, every in-bounds cell in the bomb's eventual radius-five circular blast footprint SHALL show the non-advancing first frame of `SmokePoff`; the preview SHALL be presentation-only and SHALL NOT damage or otherwise change those cells.

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

#### Scenario: Fuse previews the eventual blast area

- **WHEN** a planted `💣` is waiting for its timed detonation
- **THEN** each in-bounds cell of its eventual radius-five circular footprint SHALL display the still first `SmokePoff` frame above its existing world content
- **AND** that preview SHALL neither replace the bomb glyph nor make any cell hazardous

#### Scenario: Detonation replaces the bomb glyph

- **WHEN** a planted `💣` reaches the existing timed detonation tick
- **THEN** the bomb cell SHALL stop rendering the planted-bomb glyph and enter the animated compound blast presentation without rendering `✶`

### Requirement: Explosion affects cells in an expanding circular grid radius

At radius `r`, a bomb's blast SHALL include grid cells whose squared Euclidean distance from the bomb cell is no greater than `r * r`. On each tick, a blast SHALL apply damage throughout its entire currently active circle, including cells reached on earlier ticks; an actor entering an active cell SHALL therefore take damage on that tick. Terrain SHALL not shield cells from a blast. A health-bearing target in the active circle SHALL receive up to `100` bomb damage per tick, clamped to its current health. An interior Overground mountain SHALL receive that damage and, at zero health, become walkable standard Overground grass. An enemy or NPC spawner SHALL receive that damage and, at zero health, be removed from occupancy; a destroyed enemy spawner SHALL be unregistered and SHALL create no later enemies. Removing an NPC spawner SHALL not remove an NPC it already created. An enemy or NPC SHALL receive that damage and, at zero health, be removed from future simulation. A player in the active circle SHALL receive the bomb's `100` base damage through the existing Defense/Shield calculation, with Shield losing the final applied damage and player health losing that same amount. New-session player health SHALL be `125 / 125`, so one full `100`-damage hit cannot kill the player. Other entity types and non-diggable terrain SHALL not be affected. The `✶` glyph SHALL NOT render for an active blast. When a cell first becomes active, its still smoke preview SHALL become the `SmokePoff` → `FirePlume` compound PFX: each member SHALL play once, FirePlume SHALL begin three SmokePoff frames before SmokePoff completes, and FirePlume SHALL render above SmokePoff for those three overlapping frames. Each active blast cell SHALL remain hazardous for the whole compound PFX presentation, and particle overlays SHALL not replace underlying terrain, objects, actors, or the planted-bomb glyph before detonation.

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

#### Scenario: Detonation starts animated smoke rather than a blast glyph

- **WHEN** a planted bomb reaches its detonation tick and a cell enters the active circular blast
- **THEN** that cell SHALL begin the `SmokePoff` animation without rendering `✶`
- **AND** the cell SHALL receive normal bomb damage while that smoke animation is visible

#### Scenario: Fire crossfades from smoke while the blast remains hazardous

- **WHEN** an active blast cell reaches the final three frames of its `SmokePoff` animation
- **THEN** that cell SHALL also begin `FirePlume` above the still-rendering smoke for exactly three frames
- **AND** the cell SHALL continue to receive normal bomb damage until its FirePlume presentation completes
