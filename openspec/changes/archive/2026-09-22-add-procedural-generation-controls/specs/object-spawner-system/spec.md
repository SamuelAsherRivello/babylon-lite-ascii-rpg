# Spec Delta

## ADDED Requirements

### Requirement: Selected per-object distribution profiles
The Object Spawner System SHALL apply independently selected Heart, Trap, and Torch distribution profiles to their respective level-spawned counts while retaining deterministic seeded placement and existing occupancy exclusions.

#### Scenario: High Heart distribution remains deterministic
- **WHEN** a realm is generated twice with the same seed and High Heart distribution
- **THEN** the Heart count and positions SHALL match, while Trap and Torch counts continue to use their independently selected profiles
