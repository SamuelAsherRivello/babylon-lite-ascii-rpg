# Spec Delta

## ADDED Requirements

### Requirement: Paired-realm static feature pass
The generation pipeline SHALL perform paired-stair placement after both realm
terrain and walkability results are available. The pass SHALL select only
coordinates valid in both realms and SHALL not rewrite terrain or walkability
to force an invalid coordinate to become a stair.

#### Scenario: Invalid shared coordinate is rejected
- **WHEN** a candidate stair coordinate is blocked or unreachable in either
  realm
- **THEN** it is not accepted as a paired stair coordinate
