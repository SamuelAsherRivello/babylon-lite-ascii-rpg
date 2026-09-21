# Spec Delta

## MODIFIED Requirements

### Requirement: Keyboard grid movement

The game SHALL accept WASD and arrow keys as equivalent cardinal directions:
`W`/Up for north, `A`/Left for west, `S`/Down for south, and `D`/Right for
east. A movement step SHALL advance one grid cell only when the destination is
inside the world and walkable. Pressing or holding two orthogonal directions
SHALL produce one diagonal grid-cell step in the combined direction. A fence
or closed door SHALL be treated as non-walkable. An attempted move into a
closed door SHALL resolve its lock interaction before any movement occurs.
Each successful walking step SHALL consume `1` stamina, each successful sprint step
SHALL consume `2` stamina, and a same-boundary T tick SHALL recover `10` after
the movement cost. Unsuccessful movement SHALL not advance world time or
change stamina; unlocking a door SHALL also leave both unchanged.

#### Scenario: Cardinal key press

- **WHEN** the player presses a mapped cardinal key while a destination cell is
  inside the world and walkable
- **THEN** the player SHALL move immediately by one grid cell in that direction,
  world time SHALL increase by exactly one, and the stamina system SHALL apply
  the walking cost before any same-boundary T-tick recovery

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
  SHALL increase by exactly one, and the applicable walking or sprint stamina
  cost SHALL be applied before any same-boundary T-tick recovery

#### Scenario: Diagonal key combination

- **WHEN** the player holds two mapped orthogonal keys such as `W` and `A` and
  the diagonal destination is walkable
- **THEN** each movement trigger SHALL move the player exactly one cell
  diagonally up-left and apply one walking or sprint stamina cost according to
  the active movement mode

#### Scenario: Direction release

- **WHEN** one key in a diagonal combination is released while the other key
  remains held
- **THEN** subsequent movement triggers SHALL use only the remaining direction

#### Scenario: Held movement repeat

- **WHEN** a held mapped key or key combination produces multiple successful
  walking movement steps
- **THEN** each successful step SHALL use the normal walking cadence and consume
  exactly `1` stamina

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
  applies stamina rules only if the destination is walkable

#### Scenario: Diagonal swipe hold

- **WHEN** a player swipes and holds toward a diagonal octant on unobstructed
  game canvas
- **THEN** the game immediately attempts one diagonal movement and repeats at
  the active cadence, applying the relevant stamina cost once per successful
  step

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

## ADDED Requirements

### Requirement: Shift sprinting uses a faster cadence

Holding Shift with a mapped movement input SHALL activate sprint movement. A
successful sprint step SHALL consume `2` stamina and SHALL use a shorter repeat
cadence than normal walking. The exact sprint intervals SHALL remain centralized
and tunable without changing the movement contract.

#### Scenario: Sprint movement

- **WHEN** the player holds Shift and a mapped movement input reaches a valid
  walkable destination
- **THEN** the player SHALL move one grid cell, consume `2` stamina, and use a
  cadence faster than ordinary walking

#### Scenario: Sprint release

- **WHEN** the player releases Shift while a movement direction remains held
- **THEN** subsequent movement SHALL return to the ordinary walking cadence and
  consume `1` stamina per successful step
