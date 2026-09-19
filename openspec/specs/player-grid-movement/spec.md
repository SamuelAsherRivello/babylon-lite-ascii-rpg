# player-grid-movement Specification

## Purpose
Provides the first playable ASCII-RPG space: a resizable screen-sized logical
world with a grid-aligned player that responds consistently to keyboard input.

## Requirements

### Requirement: Full-screen logical rendering

The game SHALL render through the Babylon Lite game layer into the full browser
viewport with no outer margins. The logical viewport dimensions SHALL be the
current screen dimensions divided by the configured `upscale` value, which
defaults to `1.0`. The game SHALL support a default grid-cell width of `32`
logical units and a default grid-cell height of `32` logical units.

#### Scenario: Default one-to-one rendering

- **WHEN** the browser viewport is `1280 x 720` and `upscale` is `1.0`
- **THEN** the logical viewport SHALL be `1280 x 720` and each grid cell SHALL
  occupy `32 x 32` logical units

#### Scenario: Upscaled logical rendering

- **WHEN** the browser viewport is `1280 x 720` and `upscale` is `2.0`
- **THEN** the logical viewport SHALL be `640 x 360` and the logical output
  SHALL be scaled to fill the `1280 x 720` screen

#### Scenario: Browser resize

- **WHEN** the browser viewport changes size
- **THEN** the screen dimensions, logical dimensions, and rendered grid SHALL
  update to fill the new viewport without adding margins

### Requirement: Grid-aligned player rendering

The game SHALL render one player glyph as the letter `P` through the Babylon
Lite game layer. The glyph SHALL use one grid cell at the default font
resolution of `1.0`, its visual center SHALL align with the center of the
player's current logical grid cell, and its color and alpha SHALL come from
the active palette.

#### Scenario: Initial player placement

- **WHEN** a new game view is shown
- **THEN** a `P` SHALL be visible in the center grid cell of the logical
  viewport when that cell is walkable, otherwise in a valid connected
  walkable start cell

#### Scenario: Player cell movement

- **WHEN** the player moves by one cardinal or diagonal step into a walkable
  destination cell
- **THEN** the `P` SHALL render in the destination grid cell with its center
  aligned to that cell's center and with the active palette style for `P`

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

### Requirement: Held-key repeat timing

The Babylon Lite game layer SHALL repeat movement for a held mapped key or key
combination. The first movement SHALL occur immediately on the initial press,
the next movement SHALL occur after `0.25` seconds, and subsequent movements
SHALL occur every `0.125` seconds until the relevant keys are released.

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

The world SHALL be independent of the viewport, but the Babylon Lite renderer
SHALL show only cells within the current logical viewport and the player SHALL
not move outside the world or to a non-walkable cell.

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
