# Spec Delta

## ADDED Requirements

### Requirement: Continuous renderer handoff during realm swaps

Babylon Lite SHALL preserve renderer-layer continuity while replacing the
active realm during a covered transition. Realm replacement SHALL update the
existing game-layer presentation or otherwise keep an attached presentation
surface available for the destination frame; it SHALL NOT expose a transient
state in which the active game layer has been removed before its replacement is
ready.

#### Scenario: Covered swap retains an attached game presentation

- **WHEN** Babylon Lite replaces the active realm at the transition midpoint
- **THEN** the game renderer SHALL retain an attached presentation surface from
  the midpoint through the first destination render

#### Scenario: Destination presentation precedes mask opening

- **WHEN** the destination world and its visible cells have been submitted
  during the covered phase
- **THEN** the destination frame SHALL be synchronously presented before the
  transition mask exposes any transparent aperture

#### Scenario: React UI remains outside the repair

- **WHEN** the renderer handoff is performed
- **THEN** the React UI layer and its controls SHALL remain above and
  independent of the game-layer transition surface
