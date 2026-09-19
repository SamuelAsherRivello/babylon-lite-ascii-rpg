# Spec Delta

## MODIFIED Requirements

### Requirement: Keyboard grid movement

The game SHALL accept WASD and arrow keys as equivalent cardinal directions:
`W`/Up for north, `A`/Left for west, `S`/Down for south, and `D`/Right for
east. A movement step SHALL advance one grid cell only when the destination is
inside the world and walkable. Pressing or holding two orthogonal directions
SHALL produce one diagonal grid-cell step in the combined direction. Each
successful step into a different walkable cell SHALL advance the Time System by
exactly one unit; unsuccessful movement SHALL not advance world time.

#### Scenario: Cardinal key press

- **WHEN** the player presses a mapped cardinal key while a destination cell is
  inside the world and walkable
- **THEN** the player SHALL move immediately by one grid cell in that direction
  and world time SHALL increase by exactly one

#### Scenario: Wall collision

- **WHEN** the player presses a mapped key whose destination cell is a wall
- **THEN** the player SHALL remain in the current cell and world time SHALL
  remain unchanged

#### Scenario: Diagonal key combination

- **WHEN** the player holds two mapped orthogonal keys such as `W` and `A` and
  the diagonal destination is walkable
- **THEN** each movement trigger SHALL move the player exactly one cell
  diagonally up-left and world time SHALL increase by exactly one

#### Scenario: Direction release

- **WHEN** one key in a diagonal combination is released while the other key
  remains held
- **THEN** subsequent movement triggers SHALL use only the remaining direction

#### Scenario: Held movement repeat

- **WHEN** a held mapped key or key combination produces multiple successful
  movement steps
- **THEN** world time SHALL increase once for each successful step
