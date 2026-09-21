# Spec Delta

## MODIFIED Requirements

### Requirement: Narrow realm lifecycle commands
React SHALL send only deliberate realm-restart and ambient-preference commands
through the existing bridge. Babylon Lite SHALL own generated realm data,
active world and realm selection, player transfer, per-realm fog, collision,
and rendering; React SHALL NOT inspect or mutate realm cells or fog fields.
Babylon Lite SHALL also own the authoritative rendered player marker and SHALL
remove stale player markers before presenting a destination realm, so only the
current controllable player is rendered.

#### Scenario: UI restarts a named realm through the bridge
- **WHEN** the player activates a named realm restart control
- **THEN** the bridge sends that named request and Babylon Lite replaces the
  realm without exposing mutable world or fog data to React

#### Scenario: Realm activation presents one player
- **WHEN** Babylon Lite activates a realm at startup or after a transfer
- **THEN** it renders one player marker at the authoritative player position,
  removes any stale generated start marker, and keeps movement input attached
  to that same player
