# Spec Delta

## MODIFIED Requirements

### Requirement: SPACE places a bomb from the selected inventory capability

When gameplay input is available, a non-repeating SPACE key press SHALL request the `bomb` capability through the existing inventory action-resolution system. If the character has at least one bomb, a cardinal heading location exists, and no planted bomb already occupies that heading location, the game SHALL plant one bomb at the heading location and decrement the stack by exactly one. The heading location SHALL be the grid cell immediately in front of the player's most recent successful cardinal movement, never the player's current cell. Failed placement SHALL not consume a bomb. A planted bomb SHALL not claim exclusive character occupancy or block actor movement. A planted bomb SHALL render with the `💣` glyph and remain at its planted cell after the player leaves; when its existing timed explosion begins, the existing `✶` blast glyph SHALL replace it at that cell.

#### Scenario: Place bomb at the current cell

- **WHEN** the player successfully moves right and then presses SPACE with a positive bomb count and no bomb at the cell immediately right of the player
- **THEN** one bomb SHALL appear one cell right of the player, no bomb SHALL appear at the player's current cell, and the bomb count SHALL decrease by one

#### Scenario: Cardinal headings select their adjacent cells

- **WHEN** the player has most recently moved up, down, left, or right and requests bomb placement
- **THEN** the bomb target SHALL be respectively the immediately adjacent north, south, west, or east grid cell

#### Scenario: Placement without a cardinal heading fails

- **WHEN** the player presses SPACE before any successful cardinal movement or after a diagonal movement with no prior cardinal heading
- **THEN** no bomb SHALL be planted, world time SHALL remain unchanged, and the bomb count SHALL remain unchanged

#### Scenario: SPACE repeat does not place extra bombs

- **WHEN** SPACE is held and the browser emits repeated keydown events
- **THEN** only the initial key press SHALL request bomb placement

#### Scenario: Occupied bomb cell rejects placement

- **WHEN** the player presses SPACE while a planted bomb already occupies the heading location
- **THEN** no additional bomb SHALL be planted and the bomb count SHALL remain unchanged

#### Scenario: Actor can move over a planted bomb

- **WHEN** a player or another actor enters a planted bomb's cell before detonation
- **THEN** actor occupancy and movement SHALL remain valid and the bomb SHALL remain planted

#### Scenario: Detonation replaces the bomb glyph

- **WHEN** a planted `💣` reaches the existing timed detonation tick
- **THEN** the bomb cell SHALL render the existing `✶` blast glyph for the active explosion
