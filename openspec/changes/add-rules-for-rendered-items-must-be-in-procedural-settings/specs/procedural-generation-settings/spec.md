# Spec Delta

## MODIFIED Requirements

### Requirement: Ordered pass density catalog
The Level Generation tab SHALL display cards in this order: Ground (1), Cave / Walls (2), Water (3), Walkability (4), Player Position (5), Object Distribution (6), NPC Spawner Distribution (7), Civilization (8), and Enemy Spawner Distribution (9). The Object Distribution card SHALL group separate rows for every registered configurable level-generated object, including Heart, Trap, Torch, Fireplace, and future qualifying objects; each row SHALL expose its declared Low, Med, and High Density & Distribution selections. Player Position and any declared fixed-baseline generated feature SHALL display their baseline without an unsupported density control. Each configurable entry SHALL visibly identify its selected value.

#### Scenario: Render the current catalog
- **WHEN** the Procedural modal opens
- **THEN** all nine ordered cards are visible or reachable by scrolling, every registered configurable generated feature has its own control, and no fixed-baseline entry has a density control

#### Scenario: New generated object appears in Object Distribution
- **WHEN** a configurable object is registered as level-generated
- **THEN** the Object Distribution card SHALL show its labeled density row without requiring a separate top-level pass card
