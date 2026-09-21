# Spec Delta

## MODIFIED Requirements

### Requirement: Narrow UI-to-game communication

React SHALL communicate with Babylon Lite through deliberate UI commands and
confirmed data snapshots only. Palette updates SHALL use complete, validated
palette snapshots rather than mutable store access or individual glyph patches.
React SHALL NOT directly mutate game state, movement state, world cells,
renderer internals, or input state. Babylon Lite SHALL remain authoritative
for runtime game state, stamina-derived combat statistics, and damage
resolution. Babylon Lite SHALL publish only immutable Offense and Defense
snapshots needed by the Character HUD; React SHALL not calculate those values.

#### Scenario: Palette command
- **WHEN** a developer confirms an Ascii Palette edit in React
- **THEN** React SHALL send the confirmed palette snapshot to Babylon Lite and Babylon Lite SHALL apply it to in-world glyph rendering

#### Scenario: Startup argument consumption
- **WHEN** React changes a supported argument such as `?randomSeed=value` through its Arguments UI
- **THEN** React SHALL write the URL and Babylon Lite SHALL consume that argument when the game starts; React SHALL NOT send it as a live game command

#### Scenario: Combat snapshot remains narrow
- **WHEN** stamina changes after an attack or movement-driven recovery
- **THEN** Babylon Lite SHALL publish immutable Offense and Defense current/max snapshots and React SHALL update only the corresponding HUD bars

#### Scenario: React cannot resolve combat damage
- **WHEN** a player or enemy attack is resolved
- **THEN** Babylon Lite SHALL calculate current Offense, current Defense, and applied damage without requiring React state or UI calculations
