# Spec Delta

## ADDED Requirements

### Requirement: Minimap consumes quest-owned marker state

Babylon Lite SHALL derive minimap object markers from active quest-owned object identities in the Object Spawner System's current state. Object type or `IsPickup` status alone SHALL not make an object eligible for a marker. React SHALL not receive object coordinates or mutable object collections.

#### Scenario: Active pickup is marked
- **WHEN** an active quest pickup is inside or outside the minimap viewport
- **THEN** the existing pickup marker behavior SHALL use the pickup's centralized object identity and position

#### Scenario: Non-quest objects are not marked
- **WHEN** an active Heart, Trap, Torch, or Stairs object exists in the active realm
- **THEN** it SHALL not produce a minimap quest marker or edge indicator
