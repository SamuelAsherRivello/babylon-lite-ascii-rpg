# player-grid-movement Specification

## Purpose
Provides the first playable ASCII-RPG space: a resizable screen-sized logical
world with a grid-aligned player that responds consistently to keyboard input.

## Requirements

### Requirement: Full-screen logical rendering
The game SHALL render through the Babylon Lite game layer into the full browser viewport with no outer margins. The logical viewport dimensions SHALL be the current screen dimensions divided by the configured `upscale` value, which defaults to `1.0`. The game SHALL support the displayed zoom range `1`–`10`, with displayed zoom `1` using 0.1× the current zoom-1 scale, displayed zoom `10` using the current zoom-10 scale, and displayed zooms `2`–`9` evenly distributed additively between those endpoints.

#### Scenario: Farthest zoom
- **WHEN** the browser viewport is `1280 x 720`, `upscale` is `1.0`, and displayed zoom is `1`
- **THEN** the visible grid SHALL expand by the remapped effective scale and rendering SHALL remain bounded by the world dimensions

#### Scenario: Closest zoom
- **WHEN** the browser viewport is `1280 x 720`, `upscale` is `1.0`, and displayed zoom is `10`
- **THEN** the visible grid SHALL match the current zoom-10 effective view

#### Scenario: Default one-to-one rendering
- **WHEN** the browser viewport is `1280 x 720`, `upscale` is `1.0`, and the migrated default is active
- **THEN** the logical viewport SHALL fill the screen at the preserved default effective scale

#### Scenario: Zoomed-out rendering
- **WHEN** displayed zoom is below the migrated default
- **THEN** cells SHALL become smaller and the visible grid SHALL contain more columns and rows

#### Scenario: Upscaled logical rendering
- **WHEN** `upscale` is `2.0`
- **THEN** logical output SHALL be scaled to fill the same browser viewport

#### Scenario: Zoomed-in rendering
- **WHEN** displayed zoom is `10`
- **THEN** cells SHALL use the current closest effective scale

#### Scenario: Browser resize
- **WHEN** the browser viewport changes size
- **THEN** the screen dimensions, logical dimensions, and rendered grid SHALL update to fill the new viewport without adding margins, while retaining the current displayed zoom, effective scale, and player world position

### Requirement: Grid-aligned player rendering

The game SHALL render one player glyph as `🤺` through the Babylon
Lite game layer. The glyph SHALL use one grid cell at the default font
resolution of `1.0`, its visual center SHALL align with the center of the
player's current logical grid cell, and its color and alpha SHALL come from
the active palette.

#### Scenario: Initial player placement

- **WHEN** a new game view is shown
- **THEN** a `🤺` SHALL be visible in the center grid cell of the logical
  viewport when that cell is walkable, otherwise in a valid connected
  walkable start cell

#### Scenario: Player cell movement

- **WHEN** the player moves by one cardinal or diagonal step into a walkable
  destination cell
- **THEN** the `🤺` SHALL render in the destination grid cell with its center
  aligned to that cell's center and with the active palette style for `🤺`

### Requirement: Keyboard grid movement

The game SHALL accept WASD and arrow keys as equivalent cardinal directions:
`W`/Up for north, `A`/Left for west, `S`/Down for south, and `D`/Right for
east. A movement step SHALL advance one grid cell only when the destination is
inside the world and walkable. Pressing or holding two orthogonal directions
SHALL produce one diagonal grid-cell step in the combined direction. A fence
or closed door SHALL be treated as non-walkable. An attempted move into a
closed door SHALL resolve its lock interaction before any movement occurs.
Walking and sprinting SHALL NOT consume stamina. Each successful movement SHALL
advance a movement T tick that recovers `10` stamina, capped at the current
maximum. Unsuccessful movement SHALL not advance world time or change stamina;
unlocking a door SHALL also leave both unchanged.

#### Scenario: Cardinal key press

- **WHEN** the player presses a mapped cardinal key while a destination cell is
  inside the world and walkable
- **THEN** the player SHALL move immediately by one grid cell in that direction,
  world time SHALL increase by exactly one, no movement cost SHALL be applied,
  and the same-boundary movement T tick SHALL recover `10` stamina

#### Scenario: Fence collision

- **WHEN** the player presses a mapped key whose destination cell is a fence
- **THEN** the player SHALL remain in the current cell, world time SHALL remain
  unchanged, and stamina SHALL remain unchanged

#### Scenario: Wall collision

- **WHEN** the player presses a mapped key whose destination cell is a wall
- **THEN** the player SHALL remain in the current cell, world time SHALL remain
  unchanged, and stamina SHALL remain unchanged

#### Scenario: Locked door without a key

- **WHEN** the player presses a mapped key whose destination cell is a closed
  door and the player has no key
- **THEN** the player SHALL remain in the current cell, world time SHALL remain
  unchanged, and stamina SHALL remain unchanged

#### Scenario: Door unlock attempt with a key

- **WHEN** the player presses a mapped key whose destination cell is a closed
  door and the player has a key
- **THEN** one key SHALL be spent, the door SHALL become open, the player SHALL
  remain in the current cell, world time SHALL remain unchanged, and stamina
  SHALL remain unchanged

#### Scenario: Movement through an open door

- **WHEN** the player presses the same direction after the door is open
- **THEN** the player SHALL move one grid cell through the doorway, world time
  SHALL increase by exactly one, no movement cost SHALL be applied, and the
  same-boundary movement T tick SHALL recover `10` stamina

#### Scenario: Diagonal key combination

- **WHEN** the player holds two mapped orthogonal keys such as `W` and `A` and
  the diagonal destination is walkable
- **THEN** each movement trigger SHALL move the player exactly one cell
  diagonally up-left without consuming stamina

#### Scenario: Direction release

- **WHEN** one key in a diagonal combination is released while the other key
  remains held
- **THEN** subsequent movement triggers SHALL use only the remaining direction

#### Scenario: Held movement repeat

- **WHEN** a held mapped key or key combination produces multiple successful
  walking movement steps
- **THEN** each successful step SHALL use the normal walking cadence, consume no
  stamina, and recover `10` on its movement T tick

### Requirement: Held-key repeat timing

The Babylon Lite game layer SHALL repeat movement for a held mapped key or key
combination. The first movement SHALL occur immediately on the initial press,
the next movement SHALL occur after `0.25` seconds, and subsequent movements
SHALL occur every `0.125` seconds until the relevant keys are released.

#### Scenario: Held cardinal key
- **WHEN** the player holds a mapped key
- **THEN** movement SHALL occur at press time, again after `0.25` seconds, and
  then every `0.125` seconds while the key remains held, stopping at walls,
  fences, and still-closed doors

#### Scenario: Held diagonal combination
- **WHEN** the player holds two mapped orthogonal keys
- **THEN** the same immediate, delayed, and repeating timing SHALL apply to the
  combined diagonal direction

#### Scenario: Key release stops repeat
- **WHEN** all keys contributing to the current direction are released
- **THEN** no further repeat movement SHALL occur for that direction

### Requirement: Screen-sized world boundaries
The world SHALL be independent of the viewport, and the Babylon Lite renderer SHALL show only cells within the current logical viewport. The active camera mode SHALL determine how the visible origin responds to player movement at every remapped displayed zoom, including the larger far-zoom viewport. The outermost row and column of the generated world SHALL remain non-walkable `W` cells, and the renderer SHALL never synthesize or render cells outside the world to fill a viewport.

#### Scenario: Movement at a far-zoom world edge
- **WHEN** displayed zoom `1` makes the visible viewport reach a world edge
- **THEN** the player SHALL remain constrained by valid walkable cells and the renderer SHALL clamp the visible origin without rendering beyond the border

#### Scenario: Movement at a world edge
- **WHEN** movement targets outside the world or a border wall
- **THEN** the player SHALL remain in its current cell

#### Scenario: Movement outside the visible viewport in Camera Center
- **WHEN** movement targets a valid cell outside the viewport in Camera Center mode
- **THEN** the player SHALL move and the viewport SHALL follow subject to world clamping

#### Scenario: Movement outside the visible viewport
- **WHEN** movement targets a valid cell outside the viewport in Camera Lock mode
- **THEN** the player SHALL move without ordinary viewport following

#### Scenario: Movement within the Camera Deadzone
- **WHEN** movement remains inside the active deadzone
- **THEN** the viewport origin SHALL remain unchanged

#### Scenario: Movement beyond the Camera Lock screen edge
- **WHEN** movement crosses a visible edge in Camera Lock mode and the wrapped destination is valid
- **THEN** the player SHALL move to the wrapped destination and appear at the opposite edge

#### Scenario: Movement at an edge
- **WHEN** movement targets outside both the viewport and world
- **THEN** the player SHALL remain in its current cell

#### Scenario: Resize near a boundary
- **WHEN** the browser resizes near a world boundary
- **THEN** the player SHALL remain on its world cell and the origin SHALL clamp to valid coordinates

#### Scenario: Resize near a visible boundary
- **WHEN** the browser resizes at any displayed zoom
- **THEN** the player SHALL remain on its world cell, the selected camera mode SHALL recalculate its visible origin or wrap geometry, and the renderer SHALL not render beyond the world boundary

### Requirement: Canvas swipe grid movement

The game SHALL accept pointer swipes that begin on unobstructed game canvas as
an alternative to keyboard movement. Crossing the gesture threshold SHALL
resolve to the nearest of eight equal-angle directions and immediately attempt
one grid-cell movement. A held swipe SHALL repeat using the active walking,
sprint, or exhausted cadence. Touch movement SHALL use the same collision,
camera, time-advance, and stamina rules as keyboard movement.

#### Scenario: Cardinal swipe

- **WHEN** a player swipes upward on unobstructed game canvas past the gesture
  threshold
- **THEN** the game immediately attempts one northward grid-cell movement and
  recovers stamina only if the destination is walkable and movement succeeds

#### Scenario: Diagonal swipe hold

- **WHEN** a player swipes and holds toward a diagonal octant on unobstructed
  game canvas
- **THEN** the game immediately attempts one diagonal movement and repeats at
  the active cadence without applying a walking or sprinting stamina cost

#### Scenario: Gesture release

- **WHEN** a player releases or cancels an active swipe
- **THEN** touch-held movement stops without stopping an independently held
  keyboard direction

#### Scenario: Gesture interrupted by resize

- **WHEN** the browser resizes or rotates during an active swipe hold
- **THEN** the active swipe is cancelled and no stale touch repeat continues

#### Scenario: UI interaction

- **WHEN** a player starts a pointer interaction on a UI control or editor
- **THEN** the interaction performs its UI behavior and does not start player
  movement or alter stamina

### Requirement: Shift sprinting uses a faster cadence

Holding Shift with a mapped movement input SHALL activate sprint movement. A
successful sprint step SHALL consume no stamina and SHALL use the existing
centralized `100/3` millisecond later-repeat interval, which is shorter than the
normal `125` millisecond walking interval.

#### Scenario: Sprint movement

- **WHEN** the player holds Shift and a mapped movement input reaches a valid
  walkable destination
- **THEN** the player SHALL move one grid cell without consuming stamina and use
  a cadence faster than ordinary walking

#### Scenario: Sprint release

- **WHEN** the player releases Shift while a movement direction remains held
- **THEN** subsequent movement SHALL return to the ordinary walking cadence and
  continue consuming no stamina

#### Scenario: Exhausted walking repeat

- **WHEN** a walking movement attempt begins at `0` stamina and input remains held
- **THEN** its next later repeat SHALL be scheduled after `375` milliseconds

#### Scenario: Exhausted sprint repeat

- **WHEN** a sprint movement attempt begins at `0` stamina and input remains held
- **THEN** its next later repeat SHALL be scheduled after `100` milliseconds

### Requirement: Occupied movement resolves player combat

Before committing cardinal or diagonal player movement, the game layer SHALL check dynamic entity occupancy at the destination. If the destination contains a living enemy or spawner, the attempted movement SHALL deal the player's base `20` damage to that entity, leave the player and target in their original cells, and advance world time by one. If the damage destroys the target, its cell SHALL become available only after the combat action completes; the player SHALL NOT enter it during the same input.

#### Scenario: Cardinal movement attacks enemy
- **WHEN** the player attempts a cardinal step into a living enemy cell
- **THEN** the enemy SHALL lose 20 health, neither entity SHALL move, and world time SHALL advance by one

#### Scenario: Diagonal movement attacks spawner
- **WHEN** the player attempts a diagonal step into a living spawner cell
- **THEN** the spawner SHALL lose 20 health, neither entity SHALL move, and world time SHALL advance by one

#### Scenario: Lethal attack does not also move
- **WHEN** a player attack reduces the target to zero health
- **THEN** the target SHALL be removed but the player SHALL remain in the original cell until a later movement input

### Requirement: Movement collision with an interior mountain resolves as digging

Before rejecting a movement attempt because its destination is blocked, the game
SHALL resolve an interior Overground mountain as a dig target. Each movement
trigger SHALL resolve at most one attack turn. A dig attack SHALL not move the
player, even when it destroys the mountain; only a later movement trigger may
enter the newly walkable grass cell. This interaction SHALL use the same
destination handling for cardinal and diagonal movement.

#### Scenario: Cardinal input digs without moving
- **WHEN** a cardinal movement attempt targets an interior Overground mountain
- **THEN** one dig attack SHALL resolve and the player SHALL remain in place for
  that input

#### Scenario: Diagonal input digs without moving
- **WHEN** a diagonal movement attempt targets an interior Overground mountain
- **THEN** one dig attack SHALL resolve and the player SHALL remain in place for
  that input

#### Scenario: Held input does not move on the lethal hit
- **WHEN** a repeated movement trigger destroys the targeted mountain
- **THEN** that trigger SHALL finish with the player in the original cell, and
  a later trigger SHALL be required to enter the new grass cell
