# Spec Delta

## MODIFIED Requirements

### Requirement: Grid-aligned player rendering

The game SHALL render one player glyph as the letter `P`. The glyph SHALL use
one grid cell at the default font resolution of `1.0`, and its visual center
SHALL align with the center of the player's current logical grid cell.

#### Scenario: Initial player placement

- **WHEN** a new game view is shown
- **THEN** a `P` SHALL be visible in the center grid cell of the logical
  viewport when that cell is walkable, otherwise in a valid connected
  walkable start cell

#### Scenario: Player cell movement

- **WHEN** the player moves by one cardinal or diagonal step into a walkable
  destination cell
- **THEN** the `P` SHALL render in the destination grid cell with its center
  aligned to that cell's center

### Requirement: Keyboard grid movement

The game SHALL accept WASD and arrow keys as equivalent cardinal directions:
`W`/Up for north, `A`/Left for west, `S`/Down for south, and `D`/Right for
east. A movement step SHALL advance one grid cell only when the destination is
inside the world and walkable. Pressing or holding two orthogonal directions
SHALL produce one diagonal grid-cell step in the combined direction.

#### Scenario: Cardinal key press

- **WHEN** the player presses a mapped cardinal key while a destination cell is
  inside the world and walkable
- **THEN** the player SHALL move immediately by one grid cell in that direction

#### Scenario: Wall collision

- **WHEN** the player presses a mapped key whose destination cell is a wall
- **THEN** the player SHALL remain in the current cell

#### Scenario: Diagonal key combination

- **WHEN** the player holds two mapped orthogonal keys such as `W` and `A` and
  the diagonal destination is walkable
- **THEN** each movement trigger SHALL move the player exactly one cell
  diagonally up-left

#### Scenario: Direction release

- **WHEN** one key in a diagonal combination is released while the other key
  remains held
- **THEN** subsequent movement triggers SHALL use only the remaining direction

### Requirement: Held-key repeat timing

The game SHALL repeat movement for a held mapped key or key combination. The
first movement SHALL occur immediately on the initial press, the next movement
SHALL occur after `0.25` seconds, and subsequent movements SHALL occur every
`0.125` seconds until the relevant keys are released.

#### Scenario: Held cardinal key

- **WHEN** the player holds a mapped key
- **THEN** movement SHALL occur at press time, again after `0.25` seconds, and
  then every `0.125` seconds while the key remains held, stopping at walls

#### Scenario: Held diagonal combination

- **WHEN** the player holds two mapped orthogonal keys
- **THEN** the same immediate, delayed, and repeating timing SHALL apply to the
  combined diagonal direction

#### Scenario: Key release stops repeat

- **WHEN** all keys contributing to the current direction are released
- **THEN** no further repeat movement SHALL occur for that direction

### Requirement: Screen-sized world boundaries

The world SHALL be independent of the viewport, but the renderer SHALL show
only cells within the current logical viewport and the player SHALL not move
outside the world or to a non-walkable cell.

#### Scenario: Movement at a world edge

- **WHEN** a movement input targets a cell outside the world
- **THEN** the player SHALL remain in the current cell and SHALL not render
  beyond the world boundary

#### Scenario: Movement at an edge

- **WHEN** a movement input targets a cell outside the logical viewport and
  outside the world
- **THEN** the player SHALL remain in the current cell and SHALL not render
  beyond the screen

#### Scenario: Resize near a visible boundary

- **WHEN** the browser resizes and the current player cell is outside the new
  visible area but remains valid in the world
- **THEN** the player SHALL remain on its world cell and the renderer SHALL
  update the visible portion without moving it to an invalid cell

#### Scenario: Resize near a boundary

- **WHEN** the browser resizes and the current player cell is no longer valid
  for the new logical viewport and is also outside the world
- **THEN** the player SHALL be clamped to the nearest valid visible grid cell
