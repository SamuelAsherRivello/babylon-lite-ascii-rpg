# Spec Delta

## ADDED Requirements

### Requirement: Player starts at full health

Each new game session SHALL initialize the player with current health `100` and maximum health `100` before gameplay entities process world time `1`.

#### Scenario: New player health
- **WHEN** a new game session starts
- **THEN** the authoritative player lifecycle SHALL report 100 current health and the player SHALL be alive

### Requirement: Enemy attacks use the authoritative player lifecycle

Enemy attack damage SHALL be applied through the existing authoritative player-health and death boundary. Each valid enemy attack SHALL apply `-5` health, clamp at zero, publish the resulting immutable health snapshot, and trigger the existing one-time death transition when health reaches zero.

#### Scenario: Enemy damages living player
- **WHEN** an enemy attacks a player with more than 5 health
- **THEN** player health SHALL decrease by exactly 5 and the player SHALL remain alive

#### Scenario: Enemy attack reaches zero
- **WHEN** an enemy attacks a player with 5 or less health
- **THEN** player health SHALL become exactly zero and the existing death state SHALL be published once

