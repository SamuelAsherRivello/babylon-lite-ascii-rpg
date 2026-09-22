# Spec Delta

## ADDED Requirements

### Requirement: Selected enemy-spawner distribution profile
The Underground enemy-spawner pass SHALL apply the selected Enemy Spawner Distribution profile to its normal-spawner limit while retaining its occupancy exclusions and deterministic seeded placement.

#### Scenario: Low enemy-spawner profile limits normal spawners
- **WHEN** an Underground world is generated with Low Enemy Spawner Distribution
- **THEN** it creates no more than the Low profile's normal-spawner limit and does not place a normal spawner on an excluded cell
