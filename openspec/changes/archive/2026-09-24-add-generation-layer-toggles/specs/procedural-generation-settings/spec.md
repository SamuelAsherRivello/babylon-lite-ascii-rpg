# Spec Delta

## ADDED Requirements

### Requirement: Persistent generation-layer enablement
The Level Generation tab SHALL provide a persisted enabled state for every generation pass in addition to its density. Each pass row SHALL end with a label-free checkbox whose accessible label and tooltip state whether activating it will enable or disable that pass. Ground, Walkability, and Player Position SHALL remain checked and disabled. Existing persisted settings that omit enabled state SHALL normalize every pass to enabled, and disabling then re-enabling an optional pass SHALL retain its selected density.

#### Scenario: Toggle an optional pass in the draft
- **WHEN** a developer toggles an optional pass checkbox
- **THEN** the complete unpersisted draft updates that pass's enabled state and redraws the relevant settings-map preview without persisting until Confirm

#### Scenario: Restore a legacy catalog
- **WHEN** a persisted catalog contains valid densities but no enabled values
- **THEN** every pass restores as enabled with its prior normalized density

#### Scenario: Re-enable an optional pass
- **WHEN** a developer disables and later enables an optional pass
- **THEN** its prior Low, Med, or High density remains selected

### Requirement: Compound layer enablement controls
The Object Distribution, Civilization Placement, and Character Distribution cards SHALL each provide a parent checkbox that controls only their direct child passes. A parent checkbox SHALL be checked when all children are enabled, unchecked when all are disabled, and expose a mixed state when children differ; toggling it SHALL enable or disable all of its direct children without changing unrelated optional passes.

#### Scenario: Disable a compound layer
- **WHEN** a developer disables the Civilization Placement parent checkbox
- **THEN** Stairs, Doors, and Homes become disabled in the draft while Enemy Spawner Distribution retains its existing enabled state

#### Scenario: Represent individually mixed children
- **WHEN** a compound card has both enabled and disabled child passes
- **THEN** its parent checkbox exposes a mixed state and no child selection is changed until the developer toggles that parent
