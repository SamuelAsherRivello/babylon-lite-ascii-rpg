# Spec Delta

## ADDED Requirements

### Requirement: Optional enemy-spawner distribution
The Enemy Spawner System SHALL distribute normal and development-only enemy spawners only when Enemy Spawner Distribution is enabled. When it is disabled, the Underground realm SHALL remain playable and SHALL contain no generated enemy spawners or their spawned enemies; the setting SHALL not require Doors or another optional generation pass to be enabled.

#### Scenario: Disabled enemy-spawner distribution
- **WHEN** an Underground realm is generated with Enemy Spawner Distribution disabled
- **THEN** it SHALL contain no normal or development-only enemy spawners and no enemy-spawner tick activity

#### Scenario: Enabled spawners without Doors
- **WHEN** an Underground realm is generated with Enemy Spawner Distribution enabled and Doors disabled
- **THEN** eligible enemy spawners SHALL still be distributed using terrain, player, and existing occupancy constraints
