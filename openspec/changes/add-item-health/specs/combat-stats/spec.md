# Spec Delta

## MODIFIED Requirements

### Requirement: Player attacks scale maximum damage by current Offense

When a valid player attack resolves against an enemy or enemy spawner, the applied damage SHALL be calculated from the target's configured maximum player damage and the player's current Offense ratio. The result SHALL be rounded to the nearest whole number and clamped to at least `1`. At full current Offense, the attack SHALL apply the configured maximum player damage. The Sword's current health SHALL decrease by the actual damage applied by the resolved attack.

#### Scenario: Full Offense deals maximum damage and wears Sword
- **WHEN** the player attacks with current Offense equal to maximum Offense
- **THEN** the target SHALL receive the configured maximum player damage and Sword health SHALL lose that applied amount

#### Scenario: Full Offense deals maximum damage
- **WHEN** the player attacks with current Offense equal to maximum Offense
- **THEN** the target SHALL receive the configured maximum player damage

#### Scenario: Reduced Offense wears Sword by reduced damage
- **WHEN** the player attacks with current Offense equal to 50% of maximum Offense
- **THEN** the target SHALL receive 50% of configured maximum damage after rounding and Sword health SHALL lose that applied amount

#### Scenario: Reduced Offense deals proportionally reduced damage
- **WHEN** the player attacks with current Offense equal to 50% of maximum Offense
- **THEN** the target SHALL receive 50% of configured maximum damage after rounding

#### Scenario: Spawner attacks use the same Sword wear rule
- **WHEN** the player attacks an enemy spawner
- **THEN** the spawner SHALL receive the configured current-Offense damage and Sword health SHALL lose the actual damage applied

#### Scenario: Spawner attacks use the same player scaling
- **WHEN** the player attacks an enemy spawner
- **THEN** the spawner SHALL receive damage calculated by the same current-Offense rule as an enemy

#### Scenario: Exhausted player can still deal minimum damage
- **WHEN** the player attacks with zero current Offense
- **THEN** the valid attack SHALL apply exactly `1` damage rather than zero damage, and Sword health SHALL lose `1`

### Requirement: Player Defense reduces incoming enemy damage

When an enemy attack resolves against the player, the applied damage SHALL begin with the enemy's configured maximum attack damage and subtract a Defense-derived mitigation contribution. The mitigation SHALL scale linearly with the player's current Defense ratio and SHALL be capped at 50% of incoming damage. Applied damage SHALL be rounded up and clamped to at least `1`. Shield health SHALL decrease by the final applied damage, and after Shield depletion the existing body path SHALL apply without shield mitigation.

#### Scenario: Shield loses final mitigated damage
- **WHEN** an enemy attacks with current Defense equal to maximum Defense
- **THEN** the player SHALL receive the existing 50%-mitigated damage and Shield health SHALL lose exactly that final applied amount

#### Scenario: No Shield uses body damage
- **WHEN** the player has no Shield and is attacked
- **THEN** the player SHALL receive the existing body-path damage without shield-based Defense mitigation

#### Scenario: Full Defense provides bounded mitigation
- **WHEN** the player is attacked with current Defense equal to maximum Defense and has a Shield
- **THEN** applied damage SHALL be 50% of the enemy's maximum attack damage, rounded up, and never less than `1`

#### Scenario: Reduced Defense provides reduced mitigation
- **WHEN** the player is attacked with current Defense equal to 50% of maximum Defense and has a Shield
- **THEN** applied damage SHALL be reduced by 25% of the enemy's maximum attack damage, rounded up

#### Scenario: Zero Defense receives maximum damage
- **WHEN** the player is attacked with zero current Defense and has a Shield
- **THEN** applied damage SHALL equal the enemy's configured maximum attack damage
