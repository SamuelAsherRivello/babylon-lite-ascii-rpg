# Spec Delta

## ADDED Requirements

### Requirement: Developer mapview remains game-layer owned

Babylon Lite SHALL own mapview world rendering, mutable world data, entity positions, enemy and spawner state, fog bypass evaluation, diagnostic lighting, marker projection, and keyboard input suppression while the mapview is open. React SHALL own only the Info launcher, overlay open/close state, and narrow commands or snapshots needed to request the mapview; React SHALL NOT receive or render mutable world cells, fog fields, entity collections, enemy positions, or renderer resources.

#### Scenario: React launches without owning world data
- **WHEN** a developer activates the `Map` control
- **THEN** React sends only a narrow mapview open request and does not receive mutable world cells or entity collections

#### Scenario: Game layer owns mapview rendering
- **WHEN** the mapview is visible
- **THEN** Babylon Lite renders the active realm and marker overlay from authoritative game-layer state

#### Scenario: Closing mapview restores input ownership
- **WHEN** the mapview closes
- **THEN** Babylon Lite restores normal keyboard input handling without React mutating game input state directly
