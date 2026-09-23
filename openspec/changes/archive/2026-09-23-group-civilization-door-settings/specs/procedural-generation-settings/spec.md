# Spec Delta

## MODIFIED Requirements

### Requirement: Ordered pass density catalog
The Level Generation tab SHALL display cards in this order: Ground (1), Overground Walls (2), Underground Caves (3), Water (4), Walkability (5), Player Position (6), Object & NPC Distribution (7), Civilization (8), and Enemy Spawner Distribution (9). The Object & NPC Distribution card SHALL group separate Heart, Trap, Torch, NPC, and Fireplace rows, each with Low, Med, and High Density & Distribution selections. The Civilization card SHALL use the same grouped-row presentation and SHALL initially contain exactly one `Doors` row with Low, Med, and High Density & Distribution selections. Player Position SHALL display its centered baseline without a density control. Each configurable entry SHALL visibly identify its selected value.

#### Scenario: Render the current catalog
- **WHEN** the Procedural modal opens
- **THEN** all nine ordered cards are visible or reachable by scrolling, Layer 7 contains its individual Object & NPC controls, Layer 8 contains the Doors control, and Player Position has no density control

#### Scenario: Select a Doors density
- **WHEN** a developer selects Low, Med, or High for Civilization's Doors row in the Underworld preview
- **THEN** that selection becomes the unpersisted draft value for door-group distribution and the selected value is visibly identified

#### Scenario: Restore a legacy Civilization selection
- **WHEN** a valid persisted catalog contains the former single `civilization` density selection but no Doors selection
- **THEN** the catalog restores that density as the Doors selection and retains the complete current ordered catalog
