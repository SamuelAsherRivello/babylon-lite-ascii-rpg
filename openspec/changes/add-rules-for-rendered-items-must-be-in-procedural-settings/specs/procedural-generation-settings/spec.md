# Spec Delta

## MODIFIED Requirements

### Requirement: Ordered pass density catalog
The Level Generation tab SHALL display the current thirteen raw catalog entries in execution order: Ground (1), Overground Walls (2), Underground Caves (3), Water (4), Walkability (5), Player Position (6), Heart (7), Trap (8), Torch (9), NPC (10), Fireplace (11), Doors (12), and Enemy Spawner Distribution (13). It SHALL present those entries as nine semantic cards: the first six entries retain individual cards, entries 7-11 form `7. Object Distribution`, entry 12 forms `8. Civilization`, and entry 13 forms `9. Enemy Spawner Distribution`. Object Distribution SHALL retain separate Heart, Trap, Torch, NPC, and Fireplace Low, Med, and High rows; Civilization SHALL retain its Doors row. Fixed Ground and Player Position entries SHALL display their baseline without density controls. Each configurable row SHALL visibly identify its selected value.

#### Scenario: Render the current catalog
- **WHEN** the Procedural modal opens
- **THEN** all nine semantic cards are visible or reachable by scrolling, their underlying entries remain in the thirteen-entry execution order, every configurable row has its own control, and Ground and Player Position have no density control

#### Scenario: Select a Doors density
- **WHEN** a developer selects Low, Med, or High for Civilization's Doors row in the Underworld preview
- **THEN** that selection becomes the unpersisted `civilization-doors` draft value for door-group distribution and the selected value is visibly identified

#### Scenario: Restore a legacy Civilization selection
- **WHEN** a valid persisted catalog contains the former single `civilization` density selection but no `civilization-doors` selection
- **THEN** the catalog restores that density as the Doors selection and retains the complete current thirteen-entry catalog

#### Scenario: New generated object appears in Object Distribution
- **WHEN** a configurable object is registered as level-generated
- **THEN** the Object Distribution card SHALL show its labeled density row without requiring a separate top-level pass card
