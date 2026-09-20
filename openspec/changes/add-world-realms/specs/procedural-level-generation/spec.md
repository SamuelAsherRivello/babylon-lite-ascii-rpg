# Spec Delta

## ADDED Requirements

### Requirement: Deterministic realm profile generation
The procedural generator SHALL support explicit realm profiles whose terrain
identity, walkability target, and per-feature occurrence probability and
parameters are independent. Given the same world identity, dimensions, realm
profile, and generation parameters, a realm's terrain and static feature
positions SHALL be repeatable.

#### Scenario: Realm profile controls terrain result
- **WHEN** Overground and Underground are generated from the same world
  identity
- **THEN** each result follows its own supplied profile rather than silently
  reusing the other realm's terrain or feature parameters

#### Scenario: Realm generation is repeatable
- **WHEN** the same realm profile and resolved world identity are generated
  twice with identical dimensions and parameters
- **THEN** terrain, walkability, player start, torches, and stairs match
