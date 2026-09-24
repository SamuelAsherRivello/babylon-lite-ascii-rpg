# Spec Delta

## MODIFIED Requirements

### Requirement: Player attacks scale maximum damage by current Offense

When a Sword response validly resolves against an enemy or enemy spawner, the applied damage SHALL be calculated from the target's configured maximum player damage and the player's current Offense ratio. The result SHALL be rounded to the nearest whole number and clamped to at least `1`. At full current Offense, the Sword response SHALL apply the configured maximum player damage. A contact without a Sword response SHALL not apply player attack damage.

#### Scenario: Full Offense deals maximum damage

- **WHEN** the Sword responds with current Offense equal to maximum Offense
- **THEN** the target receives the configured maximum player damage

#### Scenario: Reduced Offense deals proportionally reduced damage

- **WHEN** the Sword responds with current Offense equal to 50% of maximum Offense
- **THEN** the target receives 50% of configured maximum player damage after rounding

#### Scenario: Exhausted player can still deal minimum damage

- **WHEN** Sword responds with zero current Offense
- **THEN** the valid attack applies exactly `1` damage rather than zero damage

#### Scenario: Contact without Sword does not attack

- **WHEN** the player contacts an enemy without a Sword response
- **THEN** the enemy receives no player attack damage

#### Scenario: Spawner attacks use the same player scaling

- **WHEN** Sword responds to an enemy spawner
- **THEN** the spawner receives damage calculated by the same current-Offense rule as an enemy

### Requirement: Player Defense reduces incoming enemy damage

When Shield responds to an enemy attack, the applied damage SHALL begin with the enemy's configured maximum attack damage and subtract a Defense-derived mitigation contribution. The mitigation SHALL scale linearly with the player's current Defense ratio and SHALL be capped at 50% of incoming damage. Applied damage SHALL be rounded up and clamped to at least `1`. When no Shield response is available, the body SHALL receive the enemy's configured maximum attack damage without Defense mitigation.

#### Scenario: Full Defense provides bounded mitigation

- **WHEN** Shield responds with current Defense equal to maximum Defense
- **THEN** applied damage is 50% of the enemy's maximum attack damage, rounded up, and never less than `1`

#### Scenario: Reduced Defense provides reduced mitigation

- **WHEN** Shield responds with current Defense equal to 50% of maximum Defense
- **THEN** applied damage is reduced by 25% of the enemy's maximum attack damage, rounded up

#### Scenario: Shieldless body receives maximum damage

- **WHEN** an enemy attacks a player without a Shield response
- **THEN** applied damage equals the enemy's configured maximum attack damage
