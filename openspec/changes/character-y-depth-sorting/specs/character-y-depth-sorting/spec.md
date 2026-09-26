# Spec Delta

## Purpose

Defines consistent top-down depth presentation for every character visible in
the interactive game view without changing authoritative gameplay state.

## ADDED Requirements

### Requirement: Game-view character depth follows world y position

The interactive game view SHALL order the visible player, enemy, and NPC
character presentations by their authoritative grid `y` coordinate. A
character with a greater `y` coordinate SHALL be presented in front of a
visible character with a smaller `y` coordinate, including where their visual
bounds overlap. Character depth SHALL be recalculated after a relevant actor
move and after a visible-region or realm presentation change.

#### Scenario: Lower character overlaps an upper character

- **WHEN** two visible characters have overlapping presentation bounds and one
  actor's grid `y` coordinate is greater than the other's
- **THEN** the lower actor's presentation appears in front of the upper actor's
  presentation

#### Scenario: Character movement changes depth

- **WHEN** a visible player, enemy, or NPC moves across another visible
  character's grid `y` coordinate
- **THEN** the next presentation reflects their new y-based front-to-back order

#### Scenario: Camera or realm presentation changes

- **WHEN** a camera update or realm transition changes the visible character
  set
- **THEN** every visible character receives depth consistent with its current
  authoritative grid `y` coordinate without retaining stale ordering

### Requirement: Character depth ordering is deterministic and presentation-only

For characters with the same grid `y` coordinate, the game view SHALL apply a
stable deterministic fallback order. The fallback SHALL not supersede ordering
by distinct `y` coordinates. Depth presentation SHALL NOT alter character
world coordinates, occupancy, movement, collision, combat, fog/discovery,
glyph identity, mini-map, or mapview behavior.

#### Scenario: Equal-y characters remain stable

- **WHEN** visible characters share the same grid `y` coordinate across
  consecutive unchanged renders
- **THEN** their fallback presentation order remains unchanged and does not
  flicker

#### Scenario: Depth sorting leaves gameplay authoritative state unchanged

- **WHEN** the game view applies character depth ordering
- **THEN** the characters retain their existing cells and gameplay interactions
  while only their game-view presentation order changes
