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
Each successful step into a different walkable cell SHALL advance the Time
System by exactly one unit; unsuccessful movement or door unlocking SHALL not
advance world time.

#### Scenario: Cardinal key press
- **WHEN** the player presses a mapped cardinal key while a destination cell is
  inside the world and walkable
- **THEN** the player SHALL move immediately by one grid cell in that direction
  and world time SHALL increase by exactly one

#### Scenario: Fence collision
- **WHEN** the player presses a mapped key whose destination cell is a fence
- **THEN** the player SHALL remain in the current cell and world time SHALL
  remain unchanged

#### Scenario: Wall collision
- **WHEN** the player presses a mapped key whose destination cell is a wall
- **THEN** the player SHALL remain in the current cell and world time SHALL
  remain unchanged

#### Scenario: Locked door without a key
- **WHEN** the player presses a mapped key whose destination cell is a closed
  door and the player has no key
- **THEN** the player SHALL remain in the current cell and world time SHALL
  remain unchanged

#### Scenario: Door unlock attempt with a key
- **WHEN** the player presses a mapped key whose destination cell is a closed
  door and the player has a key
- **THEN** one key SHALL be spent, the door SHALL become open, the player SHALL
  remain in the current cell, and world time SHALL remain unchanged

#### Scenario: Movement through an open door
- **WHEN** the player presses the same direction after the door is open
- **THEN** the player SHALL move one grid cell through the doorway and world
  time SHALL increase by exactly one

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
  then every `0.125` seconds while the key remains held, stopping at walls,
  fences, and still-closed doors

#### Scenario: Held diagonal combination
- **WHEN** the player holds two mapped orthogonal keys
- **THEN** the same immediate, delayed, and repeating timing SHALL apply to the
  combined diagonal direction

#### Scenario: Key release stops repeat
- **WHEN** all keys contributing to the current direction are released
- **THEN** no further repeat movement SHALL occur for that direction
