# Spec Delta

## ADDED Requirements

### Requirement: Covered realm transfer presentation

When a player transfers between paired realms, the destination realm SHALL be
prepared and presented while the transition remains fully covered. The opening
phase SHALL begin only after the destination game view is ready to display, so
no empty, detached, or partially initialized game view is observable between
realms.

#### Scenario: Stair transfer opens directly onto the destination realm

- **WHEN** the player enters a paired stair and the closing iris reaches full
  coverage
- **THEN** the destination realm SHALL be active and its visible game frame
  SHALL be ready before the iris begins opening

#### Scenario: Settings transfer opens directly onto the destination realm

- **WHEN** a named realm transfer is requested through the existing Settings
  command and the closing iris reaches full coverage
- **THEN** the destination realm SHALL be active and its visible game frame
  SHALL be ready before the iris begins opening

#### Scenario: Transfer has no intermediate blank frame

- **WHEN** the destination frame is revealed at the covered-to-opening
  boundary
- **THEN** the player SHALL see either the fully covered transition surface or
  the rendered destination realm, and SHALL not see a blank or missing game
  layer for a display frame
