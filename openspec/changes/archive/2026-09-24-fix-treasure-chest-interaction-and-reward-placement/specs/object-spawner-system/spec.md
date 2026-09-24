# Object Spawner System

## ADDED Requirements

### Requirement: Chest interaction completes on the first valid cardinal step
The movement integration MUST attempt chest interaction for a cardinal destination after combat resolution reports no handled combat collision, and MUST open a closed chest during that same input without requiring a second step.

#### Scenario: First step into a chest opens it
- **WHEN** the player is cardinally adjacent to a closed chest and steps toward it
- **AND** no combat collision handles the attempted destination
- **THEN** the chest opens on that input
- **AND** the player remains in the originating cell

### Requirement: Opened chests spawn one guaranteed heart only in a valid neighboring cell
When a chest reward is a heart, the system MUST select one of the eight surrounding cells that is walkable and not occupied by the player or any active object. The chest MUST still open if no such cell exists, but MUST not place a heart in an invalid cell.

#### Scenario: Heart avoids all occupied neighbors
- **WHEN** a chest opens with a heart reward
- **THEN** exactly one heart is added when at least one surrounding cell is valid
- **AND** its cell is walkable
- **AND** its cell is not the player cell
- **AND** its cell is not occupied by any active object
