# Spec Delta

## MODIFIED Requirements

### Requirement: Keyboard grid movement

The game SHALL accept WASD and arrow keys as equivalent cardinal directions: `W`/Up for north, `A`/Left for west, `S`/Down for south, and `D`/Right for east. A movement step SHALL advance one grid cell only when the destination is inside the world and walkable. Pressing or holding two orthogonal directions SHALL produce one diagonal grid-cell step in the combined direction. A fence or closed door SHALL be treated as non-walkable. A cardinal attempted move into a contact target SHALL resolve character-state contact behavior before any movement occurs. Walking and sprinting SHALL NOT consume stamina. Each successful movement and unsupported cardinal contact SHALL advance a movement T tick that recovers `10` stamina, capped at the current maximum. A handled contact SHALL use its own outcome; it SHALL not move the player on that input.

#### Scenario: Cardinal key press

- **WHEN** the player presses a mapped cardinal key while a destination cell is inside the world and walkable
- **THEN** the player moves immediately by one grid cell in that direction, world time increases by exactly one, no movement cost is applied, and the same-boundary movement T tick recovers `10` stamina

#### Scenario: Fence collision

- **WHEN** the player presses a mapped key whose destination cell is a fence
- **THEN** the player remains in the current cell, world time remains unchanged, and stamina remains unchanged

#### Scenario: Locked door without a key

- **WHEN** the player presses a cardinal mapped key whose destination cell is a closed door and the player has no Key resource
- **THEN** the player remains in the current cell, world time advances by one movement tick, and stamina recovers by up to 10

#### Scenario: Door unlock attempt with a key

- **WHEN** the player presses a cardinal mapped key whose destination cell is a closed door and the player has a Key resource
- **THEN** one key is spent, the door becomes open, and the player remains in the current cell

#### Scenario: Movement through an open door

- **WHEN** the player presses the same direction after the door is open
- **THEN** the player moves one grid cell through the doorway, world time increases by exactly one, no movement cost is applied, and the same-boundary movement T tick recovers `10` stamina

#### Scenario: Diagonal key combination

- **WHEN** the player holds two mapped orthogonal keys such as `W` and `A` and the diagonal destination is walkable
- **THEN** each movement trigger moves the player exactly one cell diagonally up-left without consuming stamina

#### Scenario: Direction release

- **WHEN** one key in a diagonal combination is released while the other key remains held
- **THEN** subsequent movement triggers use only the remaining direction

#### Scenario: Held movement repeat

- **WHEN** a held mapped key or key combination produces multiple successful walking movement steps
- **THEN** each successful step uses the normal walking cadence, consumes no stamina, and recovers `10` on its movement T tick

### Requirement: Occupied movement resolves state-driven player contact

Before committing player movement, the game layer SHALL inspect a cardinal destination for a contact target. A living enemy or spawner SHALL be offered to the character-state capability order. Sword SHALL resolve one combat action and leave the player and target in their original cells. Without Sword, the player and target SHALL remain in their cells and the input SHALL advance one normal movement tick without damage. If a contact response destroys the target, its cell SHALL become available only after the contact action completes; the player SHALL NOT enter it during the same input. Diagonal movement SHALL not resolve player contact actions.

#### Scenario: Cardinal movement attacks enemy through Sword

- **WHEN** the player with Sword attempts a cardinal step into a living enemy cell
- **THEN** one Sword combat action resolves and neither entity moves

#### Scenario: Unhandled enemy contact advances normal movement time

- **WHEN** the player without Sword attempts a cardinal step into a living enemy cell
- **THEN** neither entity moves, the enemy loses no health, world time advances once, and stamina recovers as for normal movement

#### Scenario: Diagonal movement does not attack spawner

- **WHEN** the player attempts a diagonal step into a living spawner cell
- **THEN** no combat action resolves

#### Scenario: Lethal attack does not also move

- **WHEN** a Sword attack reduces the target to zero health
- **THEN** the target is removed but the player remains in the original cell until a later movement input

### Requirement: Cardinal movement contact with an interior mountain resolves as digging

Before rejecting cardinal movement because its destination is blocked, the game SHALL offer an interior Overground mountain as a contact target. Pickaxe SHALL resolve one dig attack and SHALL not move the player, even when it destroys the mountain; only a later movement trigger may enter the newly walkable grass cell. Without Pickaxe, the player remains in place and the input advances one normal movement tick without damaging the mountain.

#### Scenario: Cardinal input digs without moving

- **WHEN** a player with Pickaxe targets an interior Overground mountain
- **THEN** one dig attack resolves and the player remains in place for that input

#### Scenario: Diagonal input does not dig

- **WHEN** diagonal movement targets an interior Overground mountain
- **THEN** no dig attack resolves

#### Scenario: Unhandled mountain contact advances normal movement time

- **WHEN** a player without Pickaxe attempts cardinal movement into an interior Overground mountain
- **THEN** the player and mountain remain unchanged, world time advances once, and stamina recovers as for normal movement

#### Scenario: Held input does not move on the lethal hit

- **WHEN** a repeated Pickaxe trigger destroys the targeted mountain
- **THEN** that trigger finishes with the player in the original cell, and a later trigger is required to enter the new grass cell
