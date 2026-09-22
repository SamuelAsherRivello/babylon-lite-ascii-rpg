# Spec Delta

## ADDED Requirements

### Requirement: Selected terrain and placement profiles
The generator SHALL apply the selected Ground, Cave / Walls, Water, and Walkability profiles when creating a realm. Player Position SHALL retain its centered baseline. The resulting realm SHALL retain its bordered, connected, valid player-start guarantees.

#### Scenario: Low player-position distribution remains valid
- **WHEN** a Low Player Position profile chooses a broad start location
- **THEN** the selected player start is within the final connected walkable region and is not blocked water or a wall

#### Scenario: Matching selected profiles remain repeatable
- **WHEN** the generator receives the same seed, dimensions, realm profile, and selected density catalog twice
- **THEN** it produces matching terrain and player positions
