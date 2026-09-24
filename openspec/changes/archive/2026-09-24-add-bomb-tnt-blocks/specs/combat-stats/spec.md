# Spec Delta

## MODIFIED Requirements

### Requirement: Combat stats have permanent maximums and stamina-derived current values

The game SHALL initialize player stamina at `50` current out of `50` maximum and SHALL maintain separate maximum and current values for player Offense and Defense. The initial maximum for each stat SHALL be `25`. The current value SHALL be derived from the current stamina ratio using a linear factor of `1`, clamped to the inclusive range from `0` through its maximum. The Bomb capability SHALL initialize player health at `125 / 125` so a full-health player survives one `100`-damage bomb hit even without Defense mitigation. This health increase SHALL NOT change the existing stamina maximum, stamina cost, stamina recovery, or health recovery rules, and SHALL NOT change Offense or Defense maximums or their stamina-derived values.

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

## ADDED Requirements

### Requirement: Player Defense and Shield apply to bomb damage

The player SHALL receive bomb damage through the existing incoming-damage calculation. With a Shield equipped, the current Defense ratio SHALL reduce the bomb's `100` base damage using the existing mitigation formula, the player's health SHALL lose the final applied damage, and Shield health SHALL lose that same amount. Without a Shield, the player SHALL receive the full `100` damage without Defense mitigation.

#### Scenario: Full Defense mitigates bomb damage and wears Shield
- **WHEN** a player with full current Defense and a full-health Shield receives one bomb hit
- **THEN** player health SHALL decrease by `50` and Shield health SHALL decrease by `50`

#### Scenario: Missing Shield receives full bomb damage
- **WHEN** a player without a Shield receives one bomb hit at `125 / 125` health
- **THEN** player health SHALL decrease by `100` to `25` and the player SHALL remain alive

#### Scenario: Reduced Defense scales bomb damage
- **WHEN** a player with a Shield and 50% current Defense receives one bomb hit
- **THEN** player health and Shield health SHALL each decrease by `75`
