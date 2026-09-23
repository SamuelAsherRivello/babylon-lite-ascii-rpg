# diggable-mountains Specification

## Purpose

Lets players open routes through interior Overground mountains by digging,
while preserving the boundary and the distinct behavior of other blocked terrain.

## Requirements

### Requirement: Interior Overground mountains have durability

Every interior Overground mountain SHALL begin with `100` health and maximum
health. Only interior Overground mountains SHALL be valid digging targets.

#### Scenario: Generated interior mountain starts at full health
- **WHEN** a generated Overground realm becomes playable
- **THEN** each interior mountain SHALL have `100` current health out of `100`
  maximum health

### Requirement: Attempted movement into a mountain performs a dig attack

When a player attempts a cardinal or diagonal step into an interior Overground
mountain with health above zero, the game SHALL apply the existing player
attack damage calculation and resolve one full attack turn. The turn SHALL
spend the normal attack stamina cost, advance world time by exactly one, and
award the normal attack experience. The player and mountain SHALL remain in
their cells for that input, including when the hit is lethal.

#### Scenario: Player digs into an interior mountain
- **WHEN** a movement attempt targets an interior Overground mountain with
  positive health
- **THEN** the mountain SHALL lose the Offense-scaled damage for one player
  attack, the player SHALL stay in place, stamina SHALL pay the normal attack
  cost, world time SHALL advance by one, and attack experience SHALL be awarded

#### Scenario: Diagonal movement attempt digs
- **WHEN** a diagonal movement attempt targets an interior Overground mountain
  with positive health
- **THEN** the same single dig attack SHALL resolve without moving the player

### Requirement: Destroyed mountains become walkable grass

When an interior Overground mountain reaches zero health, that same terrain
cell SHALL immediately become the standard Overground grass tile and SHALL be
walkable. The movement attempt that destroys it SHALL NOT also move the player.

#### Scenario: Lethal dig opens the terrain cell
- **WHEN** a dig attack reduces an interior Overground mountain's health to zero
- **THEN** the mountain glyph and blocked terrain SHALL be replaced immediately
  by walkable Overground grass, while the player remains in the original cell

#### Scenario: Player enters a destroyed mountain on a later input
- **WHEN** the player makes a later movement attempt into the newly opened grass
  cell
- **THEN** normal movement SHALL move the player into that cell and advance one
  movement tick

### Requirement: Other blocked terrain is not diggable

Underground walls, Overground water, fences, closed doors, and other non-mountain
blocked cells SHALL retain their existing collision or interaction behavior.

#### Scenario: Underground wall remains blocked
- **WHEN** the player attempts movement into an Underground wall
- **THEN** no digging damage SHALL be applied and the existing blocked-movement
  behavior SHALL remain in effect

#### Scenario: Overground water remains blocked
- **WHEN** the player attempts movement into non-walkable Overground water
- **THEN** no digging damage SHALL be applied and the existing blocked-movement
  behavior SHALL remain in effect
