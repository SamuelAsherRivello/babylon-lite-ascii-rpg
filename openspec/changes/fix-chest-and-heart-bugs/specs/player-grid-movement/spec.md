# Spec Delta

## ADDED Requirements

### Requirement: Actual player movement resolves chest contact on the first cardinal input

The movement integration MUST attempt chest interaction for a cardinal destination after combat resolution reports no handled combat collision, and MUST open a closed chest during that same input without requiring a second step. The result of that interaction MUST be passed through the same render invalidation and world-state publication path used by the active game session.

#### Scenario: Actual keyboard movement opens the chest on first contact
- **WHEN** the player walks toward an unopened chest using a mapped cardinal keyboard direction
- **THEN** the first input opens the chest, leaves the player outside the chest cell, and publishes the chest and reward-cell changes to the active renderer

#### Scenario: Actual pointer movement opens the chest on first contact
- **WHEN** a pointer swipe resolves to a cardinal movement into an unopened chest
- **THEN** that first swipe opens the chest and publishes the same observable result as keyboard movement
