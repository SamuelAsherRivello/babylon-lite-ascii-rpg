# Spec Delta

## MODIFIED Requirements

### Requirement: Underground civilization barriers are seeded and solvable
When the Doors generation sublayer is enabled, the Underground realm SHALL run a civilization pass after natural terrain, water, walkability, and player placement. An eligible barrier SHALL span a straight 3-10 cell walkable opening between cave walls. At zoom 5, each eligible screen region SHALL have approximately a 10% seeded chance of receiving at most one barrier. A candidate SHALL be skipped unless one key can be placed between five and ten grid steps on each side of its door, never adjacent to the door. When Doors is disabled, the civilization pass SHALL add no fences, doors, or keys and SHALL leave the natural terrain available to other enabled optional passes.

#### Scenario: Valid barrier candidate
- **WHEN** Doors is enabled and an Underground screen contains a qualifying wall-bounded opening
- **THEN** the civilization pass MAY place one seeded fence line with one door

#### Scenario: Invalid key placement candidate
- **WHEN** Doors is enabled and a candidate cannot support key placement on both sides
- **THEN** the candidate SHALL remain unchanged

#### Scenario: Disabled Doors layer
- **WHEN** an Underground realm is generated with Doors disabled
- **THEN** it SHALL contain no civilization fences, doors, or keys

#### Scenario: Same seed reproduces civilization
- **WHEN** Doors is enabled and the same Underground seed, dimensions, terrain, and zoom-5 screen layout are generated twice
- **THEN** barrier, door, and key positions SHALL match exactly
