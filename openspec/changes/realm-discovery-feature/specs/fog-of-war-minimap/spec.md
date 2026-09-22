# Spec Delta

## ADDED Requirements

### Requirement: Realm-local walkable discovery percentage

The game SHALL calculate a discovery percentage for the active realm using only that realm's walkable tiles. A walkable tile SHALL count as discovered when its persistent fog visibility is greater than `0`. The percentage SHALL equal discovered walkable tiles divided by total walkable tiles in the active realm, expressed as a whole percentage from `0%` through `100%`. Unwalkable tiles SHALL NOT contribute to the numerator or denominator. The percentage SHALL reset with a newly generated world and SHALL remain isolated per realm.

#### Scenario: New realm starts with no discovered walkable tiles

- **WHEN** an active realm has walkable tiles and none have positive persistent fog visibility
- **THEN** the active realm's discovery percentage is `0%`

#### Scenario: Partially discovered realm reports walkable coverage

- **WHEN** some but not all walkable tiles in the active realm have positive persistent fog visibility
- **THEN** the active realm's discovery percentage reflects only those discovered walkable tiles divided by the active realm's total walkable tiles

#### Scenario: Unwalkable tiles do not affect discovery percentage

- **WHEN** an unwalkable tile has fog visibility or remains fogged
- **THEN** that tile does not change the active realm's discovery percentage

#### Scenario: Realm discovery percentages remain isolated

- **WHEN** the player discovers walkable tiles in Overground and then transfers to Underground
- **THEN** Underground reports only its own discovered walkable coverage and Overground's percentage is restored when the player returns

#### Scenario: Fully discovered realm reports complete coverage

- **WHEN** every walkable tile in the active realm has positive persistent fog visibility
- **THEN** the active realm's discovery percentage is `100%`
