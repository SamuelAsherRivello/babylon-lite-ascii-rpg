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

### Requirement: Narrow active-realm status snapshot
Babylon Lite SHALL publish an immutable active-world and active-realm status
snapshot through the bridge for React HUD display. React SHALL persist only
the active realm identifier and SHALL NOT persist or inspect generated realm
data, player coordinates, terrain, or fog.

#### Scenario: Realm transfer updates HUD status
- **WHEN** the player transfers through paired stairs
- **THEN** the bridge updates React with the new active realm so the HUD and
  stored realm preference match gameplay
