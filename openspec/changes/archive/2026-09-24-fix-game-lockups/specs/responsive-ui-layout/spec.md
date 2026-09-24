# Spec Delta

## ADDED Requirements

### Requirement: Explicit fullscreen activation
The application SHALL request fullscreen only from an explicit fullscreen control, never as a side effect of another menu action.

#### Scenario: Menu click
- **WHEN** a player clicks a menu action other than Fullscreen
- **THEN** no fullscreen request SHALL be made
