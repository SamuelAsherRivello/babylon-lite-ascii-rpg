# Spec Delta

## ADDED Requirements

### Requirement: Tickable entity simulation remains game-layer authoritative

Babylon Lite SHALL own the tickable-entity registry, world-time tick dispatch, birth and age state, enemy and spawner simulation, dynamic occupancy, pathfinding, combat, health, death, and health-bar presentation. React SHALL NOT receive or mutate enemy positions, spawner positions, entity health, birth times, tick registrations, pathfinding state, or health-bar animation state.

#### Scenario: World tick stays in Babylon Lite
- **WHEN** world time advances and entities in either realm simulate
- **THEN** Babylon Lite SHALL complete simulation and rendering updates without exposing mutable entity state through the React bridge

#### Scenario: Combat publishes only approved snapshots
- **WHEN** enemy combat changes player health or produces a log line
- **THEN** React SHALL receive only the existing immutable player-health, player-death, and log snapshots

### Requirement: Simulation and presentation are decoupled

The game layer SHALL simulate registered entities regardless of active realm, fog discovery, or visible region, while submitting glyphs and health-bar overlays only for entities that belong to the active realm and intersect the current visible presentation.

#### Scenario: Offscreen enemy still simulates
- **WHEN** an enemy processes a tick outside the visible region
- **THEN** its authoritative state SHALL update without submitting an onscreen glyph or health bar

#### Scenario: Realm switch reveals current simulated state
- **WHEN** the player enters a realm whose enemies simulated while inactive
- **THEN** the game renderer SHALL show their current positions and health rather than stale pre-simulation state

