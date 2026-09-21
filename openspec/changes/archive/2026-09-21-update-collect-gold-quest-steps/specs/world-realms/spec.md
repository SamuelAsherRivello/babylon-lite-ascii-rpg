# Spec Delta

## ADDED Requirements

### Requirement: Realm entry events

The realm system SHALL emit a generic immutable realm-entry event whenever a
game instance establishes or changes its active realm. The event SHALL identify
the entered realm and SHALL be available to gameplay consumers without exposing
realm cells, fog data, or transition internals.

#### Scenario: Initial Overground realm is observable

- **WHEN** a new game instance is initialized with Overground active
- **THEN** the realm system SHALL emit a realm-entry event identifying Overground

#### Scenario: Initial Underground realm is observable

- **WHEN** a new game instance is initialized with Underground active
- **THEN** the realm system SHALL emit a realm-entry event identifying Underground

#### Scenario: Stair transfer is observable

- **WHEN** the player transfers from one realm through paired stairs
- **THEN** the realm system SHALL emit one realm-entry event identifying the destination realm after the destination becomes active

#### Scenario: Realm event has no quest ownership

- **WHEN** a realm-entry event is emitted
- **THEN** the realm system SHALL publish only the generic realm fact and SHALL not inspect quest definitions, spawn gold, or update quest progress
