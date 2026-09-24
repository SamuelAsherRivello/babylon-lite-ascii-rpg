# combat-stats Specification

## Purpose
Defines the player's stamina-derived combat readiness and the deterministic
damage calculations that make Offense and Defense meaningful during combat.

## Requirements

### Requirement: Combat stats have permanent maximums and stamina-derived current values

The game SHALL initialize player stamina at `50` current out of `50` maximum
and SHALL maintain separate maximum and current values for player Offense and
Defense. The initial maximum for each stat SHALL be `25`. The current value
SHALL be derived from the current stamina ratio using a linear
factor of `1`, clamped to the inclusive range from `0` through its maximum.
The Bomb capability SHALL initialize player health at `125 / 125` so a
full-health player survives one `100`-damage bomb hit even without Defense
mitigation. This health increase SHALL NOT change the existing stamina maximum,
stamina cost, stamina recovery, or health recovery rules, and SHALL NOT change
Offense or Defense maximums or their stamina-derived values.

#### Scenario: Full stamina provides full combat readiness
- **WHEN** the player has current stamina equal to maximum stamina
- **THEN** current Offense and Defense SHALL equal their respective maximums

#### Scenario: Reduced stamina reduces both combat stats
- **WHEN** the player has 25% of maximum stamina
- **THEN** current Offense and Defense SHALL each be 25% of their respective maximums

#### Scenario: Combat readiness recovers with stamina
- **WHEN** movement-driven time recovery increases the player's stamina
- **THEN** current Offense and Defense SHALL increase to the corresponding stamina-derived values without changing their maximums

#### Scenario: Bomb safety health does not alter combat readiness
- **WHEN** a new session initializes the Bomb capability
- **THEN** player health SHALL be `125 / 125` while stamina SHALL remain `50 / 50` and maximum Offense and Defense SHALL remain `25`

### Requirement: Player Defense and Shield apply to bomb damage

The player SHALL receive bomb damage through the existing incoming-damage calculation. With a Shield equipped, the current Defense ratio SHALL reduce the bomb's `100` base damage using the existing mitigation formula, the player's health SHALL lose the final applied damage, and Shield health SHALL lose that same amount. Without a Shield, the player SHALL receive the full `100` damage without Defense mitigation.

#### Scenario: Full Defense mitigates bomb damage and wears Shield
- **WHEN** a player with full current Defense and a full-health Shield receives one bomb hit
- **THEN** player health SHALL decrease by `50` and Shield health SHALL decrease by `50`

#### Scenario: Missing Shield receives full bomb damage
- **WHEN** a player without a Shield receives one bomb hit at `125 / 125` health
- **THEN** player health SHALL decrease by `100` to `25` and the player SHALL remain alive

#### Scenario: Reduced Defense scales bomb damage
- **WHEN** a player with a Shield and 50% current Defense receives a bomb hit
- **THEN** player health and Shield health SHALL each decrease by `75`

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

### Requirement: Combat stat snapshots are immutable and authoritative

The game layer SHALL publish immutable Offense and Defense snapshots containing
current values, maximum values, and normalized current percentages whenever
stamina changes or the combat-stat maximums change. React SHALL consume these
snapshots for presentation and SHALL NOT calculate combat values or mutate
gameplay state.

#### Scenario: Attack publishes reduced combat readiness
- **WHEN** a valid player attack spends stamina
- **THEN** the next Offense and Defense snapshots SHALL expose the reduced current values and percentages

#### Scenario: Recovery publishes restored combat readiness
- **WHEN** a movement-driven recovery restores stamina
- **THEN** the next Offense and Defense snapshots SHALL expose the restored current values and percentages

### Requirement: Mountain digging uses player Offense scaling

Damage dealt while digging an interior Overground mountain SHALL use the same
maximum player attack damage and current-Offense ratio as a player attack
against an enemy. Damage SHALL be rounded to the nearest whole number and
clamped to at least `1`.

#### Scenario: Full Offense damages a mountain
- **WHEN** the player digs with current Offense equal to maximum Offense
- **THEN** the mountain SHALL receive the configured maximum player attack
  damage

#### Scenario: Reduced Offense damages a mountain
- **WHEN** the player digs with current Offense equal to `50%` of maximum
  Offense
- **THEN** the mountain SHALL receive `50%` of configured maximum damage after
  rounding

#### Scenario: Zero Offense still damages a mountain
- **WHEN** the player digs with zero current Offense
- **THEN** the mountain SHALL receive exactly `1` damage
