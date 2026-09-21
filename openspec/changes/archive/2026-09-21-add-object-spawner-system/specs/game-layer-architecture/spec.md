# Spec Delta

## ADDED Requirements

### Requirement: Object Spawner System remains game-layer authoritative

Babylon Lite SHALL own object catalog loading, seeded distribution, object collision, pickup consumption, object consequences, object rendering, Torch lighting inputs, and object/minimap state. React SHALL communicate only through existing narrow snapshots and SHALL not inspect object positions or mutable object state.

#### Scenario: Object consequence stays in the game layer
- **WHEN** the player collides with a Gold, Heart, Trap, Torch, or Stair object
- **THEN** Babylon Lite SHALL apply the object behavior and publish only the resulting approved UI snapshots or log entries
