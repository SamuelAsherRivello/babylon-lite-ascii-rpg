# Spec Delta

## MODIFIED Requirements

### Requirement: Persistent generation-layer enablement
The World Generation tab SHALL provide persisted diagnostic enabled states for generation passes in addition to their densities. In development or an explicit supported diagnostic session, each pass row SHALL end with a label-free checkbox whose accessible label and tooltip state whether activating it will enable or disable that pass. Ground, Walkability, and Player Position SHALL remain checked and disabled. Existing persisted settings that omit enabled state SHALL normalize every pass to enabled, and disabling then re-enabling an optional pass SHALL retain its selected density. Normal production gameplay SHALL resolve every applicable pass as enabled regardless of disabled values in development-edited bundled data, legacy diagnostic persistence, or diagnostic-only URL arguments outside a diagnostic session. Normal production controls SHALL NOT offer disabling or display an ineffective disabled state. Diagnostic changes SHALL NOT silently become production configuration.

#### Scenario: Toggle an optional pass in the draft
- **WHEN** a developer toggles an optional pass checkbox in development or a supported diagnostic session
- **THEN** the complete unpersisted draft updates that pass's enabled state and redraws the relevant settings-map preview without persisting until Confirm

#### Scenario: Restore a legacy catalog
- **WHEN** a persisted catalog contains valid densities but no enabled values
- **THEN** every pass restores as enabled with its prior normalized density

#### Scenario: Re-enable an optional pass
- **WHEN** a developer disables and later enables an optional pass
- **THEN** its prior Low, Med, or High density remains selected

#### Scenario: Production starts after diagnostic configuration
- **WHEN** normal production starts with a bundled or persisted catalog that disabled optional layers for debugging
- **THEN** every applicable layer is effectively enabled while valid explicit density and world-size selections are preserved

### Requirement: Compound layer enablement controls
In development or an explicit supported diagnostic session, the Object Distribution, Civilization Placement, and Character Distribution cards SHALL each provide a parent checkbox that controls only their direct child passes. A parent checkbox SHALL be checked when all children are enabled, unchecked when all are disabled, and expose a mixed state when children differ; toggling it SHALL enable or disable all of its direct children without changing unrelated optional passes. Normal production SHALL follow the all-enabled policy and SHALL NOT expose parent controls that imply production layers can be disabled.

#### Scenario: Disable a compound layer
- **WHEN** a developer disables the Civilization Placement parent checkbox in a diagnostic session
- **THEN** Stairs, Doors, and Homes become disabled in the draft while Enemy Spawner Distribution retains its existing enabled state

#### Scenario: Represent individually mixed children
- **WHEN** a diagnostic compound card has both enabled and disabled child passes
- **THEN** its parent checkbox exposes a mixed state and no child selection is changed until the developer toggles that parent

## ADDED Requirements

### Requirement: Production medium baseline is independent of debug defaults
With no valid explicit user settings, production SHALL initialize Med World Size and Med density for every configurable feature, with all applicable features enabled. Development-edited bundled densities SHALL NOT override this default. Existing valid explicit world-size and density choices SHALL retain their persistence and Confirm/Cancel semantics.

#### Scenario: Fresh production session
- **WHEN** production starts without valid persisted generation preferences
- **THEN** both realms use 256 x 256 cells and every configurable feature uses Med density with effective enablement true

#### Scenario: Restore explicit High size
- **WHEN** production starts with a valid user preference for High World Size or non-Med density
- **THEN** it restores those explicit choices while retaining all applicable layers
