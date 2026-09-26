# Spec Delta

## ADDED Requirements

### Requirement: Player heading location tracks successful cardinal movement

The game SHALL retain a player cardinal heading for gameplay systems and derive a heading location from it. After each successful cardinal movement, the heading location SHALL be the adjacent grid cell in that direction from the player's current cell. A failed movement, contact action, or diagonal movement SHALL NOT replace the most recent cardinal heading direction. Before the first successful cardinal movement, no heading location SHALL exist.

#### Scenario: Cardinal movement establishes heading location

- **WHEN** the player successfully moves one cell upward
- **THEN** the heading location SHALL be the cell immediately north of the new player cell

#### Scenario: Later cardinal movement replaces heading location

- **WHEN** the player has an upward heading location and successfully moves one cell left
- **THEN** the heading location SHALL become the cell immediately west of the new player cell

#### Scenario: Diagonal movement preserves cardinal heading direction

- **WHEN** the player has an upward cardinal heading and successfully moves diagonally
- **THEN** the heading location SHALL remain the cell immediately north of the player's new cell

#### Scenario: Failed move does not create a heading location

- **WHEN** the player has not successfully moved cardinally and attempts an unavailable movement
- **THEN** no heading location SHALL exist
