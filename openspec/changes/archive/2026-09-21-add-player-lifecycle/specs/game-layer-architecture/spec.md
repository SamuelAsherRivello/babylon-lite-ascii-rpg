# Spec Delta

## MODIFIED Requirements

### Requirement: Object Spawner System remains game-layer authoritative

Babylon Lite SHALL own object catalog loading, seeded distribution, object collision, pickup consumption, object consequences, object rendering, Torch lighting inputs, object/minimap state, and the authoritative player-death transition. React SHALL communicate only through existing narrow snapshots and SHALL not inspect object positions, mutable object state, health mutation, or lifecycle internals.

#### Scenario: Object consequence stays in the game layer
- **WHEN** the player collides with a Gold, Heart, Trap, Torch, or Stair object
- **THEN** Babylon Lite SHALL apply the object behavior and publish only the resulting approved UI snapshots or log entries

#### Scenario: Death state stays in the game layer
- **WHEN** a health consequence reaches zero health
- **THEN** Babylon Lite SHALL mark the player dead and publish only the immutable health and death snapshots needed by React
