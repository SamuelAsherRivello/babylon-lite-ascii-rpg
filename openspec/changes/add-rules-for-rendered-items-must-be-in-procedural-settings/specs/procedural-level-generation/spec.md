# Spec Delta

## MODIFIED Requirements

### Requirement: Dynamic entity state remains separate from terrain and static objects

The generated world SHALL retain enemies, enemy spawners, NPCs, and NPC spawners as explicit dynamic entity state associated with a realm. Their glyphs SHALL take visible precedence over terrain while preserving underlying terrain and static-object identity. No cell SHALL contain more than one player, enemy, enemy spawner, NPC, or NPC spawner occupant. Level-generated dynamic features SHALL be placed only by their declared generation pass after all stated static-layer prerequisites are available.

#### Scenario: Enemy moves without rewriting terrain
- **WHEN** an enemy moves from one walkable cell to another
- **THEN** both cells SHALL retain their original terrain and static-object data while dynamic occupancy changes

#### Scenario: Destroyed entity reveals underlying cell
- **WHEN** an enemy or spawner is removed at zero health
- **THEN** its former cell SHALL render the underlying object or terrain according to normal precedence

#### Scenario: NPC occupancy remains separate
- **WHEN** an NPC or NPC spawner occupies a valid Overground cell
- **THEN** its dynamic occupancy SHALL preserve the cell's terrain and static-object data and prevent another dynamic occupant from claiming that cell

#### Scenario: Dynamic feature waits for declared prerequisites
- **WHEN** a generated dynamic feature declares object or civilization occupancy as a placement prerequisite
- **THEN** it SHALL be placed only after those prerequisite layers are finalized
