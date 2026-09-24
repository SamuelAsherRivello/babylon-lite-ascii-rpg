# Spec Delta

## MODIFIED Requirements

### Requirement: Ordered pass density catalog
The World Generation tab SHALL display World Settings (1), Ground (2),
Overground Walls (3), Underground Caves (4), Water (5), Walkability (6),
Player Position (7), Object Distribution (8), Civilization Placement (9), and
Character Distribution (10), in that order. World Settings SHALL display a
World Size row with Low, Med, and High selections and a static Realm Count row.
Object Distribution SHALL group its existing direct child distribution rows,
including a Chest row with Low, Med, and High Density & Distribution
selections. Civilization Placement SHALL group its existing direct child rows,
and Character Distribution SHALL group its existing direct child rows. Player
Position SHALL display its centered baseline without a density control. Each
configurable entry SHALL visibly identify its selected value.

#### Scenario: Render the World Generation catalog
- **WHEN** the Procedural modal opens
- **THEN** all ten ordered cards are visible or reachable by scrolling, World
  Settings is pass 1, Ground is pass 2, and the later cards retain their
  relative order

#### Scenario: Identify the selected world size
- **WHEN** World Settings displays a selected World Size
- **THEN** exactly one of Low, Med, or High is visibly identified as selected

#### Scenario: Render the current catalog
- **WHEN** the Procedural modal opens
- **THEN** all ten ordered cards are visible or reachable by scrolling, Object
  Distribution contains its individual controls including Chest, Civilization
  Placement contains its existing controls, Character Distribution contains its
  existing controls, and Player Position has no density control

#### Scenario: Select a Chest density
- **WHEN** a developer selects Low, Med, or High for the Chest row
- **THEN** that selection becomes the unpersisted draft value for chest
  distribution and the selected value is visibly identified

#### Scenario: Select a Doors density
- **WHEN** a developer selects Low, Med, or High for Civilization Placement's Doors row
  in the Underworld preview
- **THEN** that selection becomes the unpersisted draft value for door-group
  distribution and the selected value is visibly identified

#### Scenario: Restore a legacy Civilization selection
- **WHEN** a valid persisted catalog contains the former single `civilization`
  density selection but no Doors selection
- **THEN** the catalog restores that density as the Doors selection and retains
  the complete current ordered catalog

## ADDED Requirements

### Requirement: Chest preview markers
The settings-map preview SHALL render the closed-chest glyph at every
deterministically selected Chest placement for its chosen realm and current
draft profile.

#### Scenario: Preview Chest density
- **WHEN** a developer changes the Chest draft selection
- **THEN** the selected realm's preview SHALL redraw its chest markers with the
  corresponding one, two, or three placement count
