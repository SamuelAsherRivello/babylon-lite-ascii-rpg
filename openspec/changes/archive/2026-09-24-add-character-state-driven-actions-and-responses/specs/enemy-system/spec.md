# Spec Delta

## MODIFIED Requirements

### Requirement: Enemy attack collision

When an eligible enemy is cardinally adjacent to the living player, its attempted step into the player cell SHALL create one incoming contact instead of moving. The contact SHALL permit the player character state to resolve one response. With the initial Shield, the existing Defense-derived damage rule SHALL apply; without a Shield response, the body SHALL take exactly `5` player health damage. Both entities SHALL remain in their cells and one damage event SHALL be emitted through the Log System when damage is applied.

#### Scenario: Adjacent enemy attacks a shielded player

- **WHEN** an eligible enemy attempts to enter the cardinally adjacent player cell with the default Shield equipped
- **THEN** neither entity moves and the player receives the Defense-derived mitigated damage

#### Scenario: Adjacent enemy attacks
- **WHEN** an eligible enemy attempts to enter the cardinally adjacent player cell
- **THEN** the player loses the configured damage, neither entity moves, and one enemy-attack log event is submitted

#### Scenario: Adjacent enemy attacks an unshielded player

- **WHEN** an eligible enemy attempts to enter the cardinally adjacent player cell without a Shield response
- **THEN** the player loses 5 health and neither entity moves

#### Scenario: Enemy attack kills the player

- **WHEN** an enemy attack reduces player health to zero
- **THEN** the existing authoritative player-death transition occurs exactly once

### Requirement: Player attack and enemy death

An attempted cardinal player movement into an adjacent enemy SHALL offer that enemy as a contact target. Sword SHALL attack instead of moving, deal the player's applicable enemy health damage, leave both entities in their cells, consume one world-time unit, and emit one damage event. Diagonal player movement SHALL not attack an enemy. At zero health, the enemy SHALL be removed from occupancy, emit one death event, unregister from future ticks, and never act again.

#### Scenario: Sword damages an adjacent enemy

- **WHEN** the player with Sword attempts cardinal movement into a living enemy cell
- **THEN** the enemy loses the applicable Sword damage, neither entity moves, and world time advances by one combat unit

#### Scenario: Player damages an enemy
- **WHEN** the player attempts to move into a living enemy cell
- **THEN** the enemy loses player attack damage, neither entity moves, and world time advances by one

#### Scenario: Diagonal movement does not attack

- **WHEN** the player attempts diagonal movement into a living enemy cell
- **THEN** no player attack resolves

#### Scenario: Enemy dies at zero health

- **WHEN** Sword damage reduces an enemy's health to zero
- **THEN** the enemy disappears, emits one death event, unregisters from future ticks, and takes no later action
