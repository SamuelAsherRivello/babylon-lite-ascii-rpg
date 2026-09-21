# Spec Delta

## ADDED Requirements

### Requirement: Dynamic entity state remains separate from terrain and static objects

The generated world SHALL retain enemies and enemy spawners as explicit dynamic entity state associated with a realm. Their glyphs SHALL take visible precedence over terrain while preserving underlying terrain and static-object identity. No cell SHALL contain more than one player, enemy, or spawner occupant.

#### Scenario: Enemy moves without rewriting terrain
- **WHEN** an enemy moves from one walkable cell to another
- **THEN** both cells SHALL retain their original terrain and static-object data while dynamic occupancy changes

#### Scenario: Destroyed entity reveals underlying cell
- **WHEN** an enemy or spawner is removed at zero health
- **THEN** its former cell SHALL render the underlying object or terrain according to normal precedence

### Requirement: Enemy-spawner generation is seed-stable

Given the same Underground world identity, dimensions, generation parameters, object positions, and civilization layout, normal enemy-spawner positions SHALL be repeatable. The development/test bonus setting SHALL be an explicit generation input and SHALL not alter production generation when disabled.

#### Scenario: Normal spawners reproduce
- **WHEN** the same Underground inputs are generated twice with the bonus disabled
- **THEN** normal enemy-spawner counts and positions SHALL match exactly

