# Spec Delta

## ADDED Requirements

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
