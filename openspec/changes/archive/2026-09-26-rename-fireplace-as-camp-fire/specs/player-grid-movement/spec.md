# Spec Delta

## MODIFIED Requirements

### Requirement: Keyboard grid movement

The game SHALL accept WASD and arrow keys as equivalent cardinal directions: `W`/Up for north, `A`/Left for west, `S`/Down for south, and `D`/Right for east. A movement step SHALL advance one grid cell only when the destination is inside the world and walkable. Pressing or holding two orthogonal directions SHALL produce one diagonal grid-cell step in the combined direction. A fence, Camp Fire, or closed door SHALL be treated as non-walkable. An attempted move into a closed door SHALL resolve its lock interaction before any movement occurs. An attempted cardinal move into a Camp Fire SHALL resolve its checkpoint dialog interaction before any movement occurs. Walking and sprinting SHALL NOT consume stamina. Each successful movement SHALL advance a movement T tick that recovers `10` stamina, capped at the current maximum. Unsuccessful movement SHALL not advance world time or change stamina; unlocking a door or opening a Camp Fire dialog SHALL also leave both unchanged.

#### Scenario: Cardinal key press
- **WHEN** the player presses a mapped cardinal key while a destination cell is inside the world and walkable
- **THEN** the player SHALL move immediately by one grid cell in that direction, world time SHALL increase by exactly one, no movement cost SHALL be applied, and the same-boundary movement T tick SHALL recover `10` stamina

#### Scenario: Fence collision
- **WHEN** the player presses a mapped key whose destination cell is a fence
- **THEN** the player SHALL remain in the current cell, world time SHALL remain unchanged, and stamina SHALL remain unchanged

#### Scenario: Camp Fire collision
- **WHEN** the player presses a mapped cardinal key whose destination cell is a Camp Fire
- **THEN** the player SHALL remain in the current cell, a modal Camp Fire dialog with an `OK` choice SHALL block gameplay input, and world time and stamina SHALL remain unchanged; its text SHALL be `You saved a checkpoint.` on that Camp Fire's first session interaction and `You already saved this checkpoint.` thereafter

#### Scenario: Wall collision
- **WHEN** the player presses a mapped key whose destination cell is a wall
- **THEN** the player SHALL remain in the current cell, world time SHALL remain unchanged, and stamina SHALL remain unchanged

#### Scenario: Locked door without a key
- **WHEN** the player presses a mapped key whose destination cell is a closed door and the player has no key
- **THEN** the player SHALL remain in the current cell, world time SHALL remain unchanged, and stamina SHALL remain unchanged

#### Scenario: Door unlock attempt with a key
- **WHEN** the player presses a mapped key whose destination cell is a closed door and the player has a key
- **THEN** one key SHALL be spent, the door SHALL become open, the player SHALL remain in the current cell, world time SHALL remain unchanged, and stamina SHALL remain unchanged

#### Scenario: Movement through an open door
- **WHEN** the player presses the same direction after the door is open
- **THEN** the player SHALL move one grid cell through the doorway, world time SHALL increase by exactly one, no movement cost SHALL be applied, and the same-boundary movement T tick SHALL recover `10` stamina

#### Scenario: Diagonal key combination
- **WHEN** the player holds two mapped orthogonal keys such as `W` and `A` and the diagonal destination is walkable
- **THEN** each movement trigger SHALL move the player exactly one cell diagonally up-left without consuming stamina

#### Scenario: Direction release
- **WHEN** one key in a diagonal combination is released while the other key remains held
- **THEN** subsequent movement triggers SHALL use the remaining cardinal direction without a stale diagonal component

#### Scenario: Held movement repeat
- **WHEN** a held mapped key or key combination produces multiple successful walking movement steps
- **THEN** each successful step SHALL use the normal walking cadence, consume no stamina, and recover `10` on its movement T tick
