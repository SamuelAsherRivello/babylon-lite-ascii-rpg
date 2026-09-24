# Spec Delta

## MODIFIED Requirements

### Requirement: Player starts at full health

Each new game session SHALL initialize the player with current health `125` and maximum health `125` before gameplay entities process world time `1`.

#### Scenario: New player health
- **WHEN** a new game session starts
- **THEN** the authoritative player lifecycle SHALL report 125 current health and the player SHALL be alive
