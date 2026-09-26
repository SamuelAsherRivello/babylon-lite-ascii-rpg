# Spec Delta

## MODIFIED Requirements

### Requirement: Every enemy simulates on every world tick

Every living enemy SHALL remain registered while it exists, but it SHALL simulate only when the living player is in the same realm and the enemy's cardinal grid distance from the player is `50` or less. An enemy outside that radius or in another realm SHALL remain in its current cell, receive no simulation delivery, and create no pathfinding, combat, or movement work for that world-time advance. It SHALL resume ordinary age-cadenced behavior on the first later eligible tick without retroactively simulating the skipped times. Simulation and rendering SHALL remain independent: an eligible offscreen enemy may simulate even when it is not rendered, while the renderer continues to render only the active visible region.

#### Scenario: Other-realm enemy sleeps

- **WHEN** world time advances while the player is in Overground and a living enemy exists Underground
- **THEN** the Underground enemy remains registered in its current cell and receives no simulation delivery or deferred job

#### Scenario: Inactive-realm enemy keeps living

- **WHEN** world time advances while the player views Overground and an enemy exists Underground
- **THEN** the Underground enemy remains registered and in its current cell, but receives no simulation delivery or deferred job

#### Scenario: Distant same-realm enemy sleeps

- **WHEN** a living enemy is in the player's realm but its cardinal grid distance from the player is 51
- **THEN** it receives no simulation delivery and performs no navigation, movement, or attack work for that world-time advance

#### Scenario: Boundary enemy remains active

- **WHEN** a living enemy is in the player's realm at cardinal grid distance 50 or less
- **THEN** it receives normal eligible world-time delivery and retains its established age cadence, movement, occupancy, and combat behavior

#### Scenario: Enemy wakes without catch-up

- **WHEN** a sleeping enemy becomes same-realm and within cardinal grid distance 50 before a later world-time advance
- **THEN** it receives that later tick once and does not replay movement, attacks, or pathfinding from skipped ticks
