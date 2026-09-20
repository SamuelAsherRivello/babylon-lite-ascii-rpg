# Spec Delta

## ADDED Requirements

### Requirement: Narrow realm lifecycle commands
React SHALL send only deliberate realm-restart and ambient-preference commands
through the existing bridge. Babylon Lite SHALL own generated realm data,
active world and realm selection, player transfer, per-realm fog, collision,
and rendering; React SHALL NOT inspect or mutate realm cells or fog fields.

#### Scenario: UI restarts a named realm through the bridge
- **WHEN** the player activates a named realm restart control
- **THEN** the bridge sends that named request and Babylon Lite replaces the
  realm without exposing mutable world or fog data to React
