# Spec Delta

## MODIFIED Requirements

### Requirement: Synchronized paired stairs

Each world SHALL generate non-blocking `S` stairs in both realms at the same
grid coordinates. The requested stair count SHALL equal the requested torch
count, subject to valid placement capacity. Every accepted paired coordinate
SHALL be walkable and reachable in both realms, SHALL not be either realm's
player start, and SHALL remain deterministic for the same world identity and
generation parameters.

#### Scenario: Stairs match across realms

- **WHEN** a generated world's stair coordinates are inspected
- **THEN** each Overground `S` has an Underground `S` at the identical
  coordinate and both underlying terrain cells are walkable

#### Scenario: Entering stairs transfers realms once

- **WHEN** the player successfully enters an `S` cell and no transition is
  active
- **THEN** the game starts the realm iris, pauses input, changes to the paired
  realm only at full iris coverage, arrives on the paired `S` coordinate,
  preserves the player's pre-transfer screen-space position, and cannot
  immediately transfer back during that transition

#### Scenario: Entering Underground persists active realm

- **WHEN** the realm iris completes after entering Overground stairs
- **THEN** Underground becomes the stored active-realm preference for the next
  refresh

#### Scenario: Settings transfer uses the same realm presentation

- **WHEN** the Settings UI activates Realm and the game moves the player along
  the shortest reachable path to an `S` cell
- **THEN** the paired-realm transfer uses the same blocking iris sequence,
  preserves discovery of every source-route cell, and arrives at the paired
  coordinate before the opening phase reveals the destination
