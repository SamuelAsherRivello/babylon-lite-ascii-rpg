# Spec Delta

## MODIFIED Requirements

### Requirement: Draft selection preview, confirmation, and regeneration
The system SHALL initialize every pass at `Med` when no valid setting exists. Selecting a density or changing a pass's enabled state SHALL update an unpersisted complete draft catalog and redraw the settings-map preview using that draft. `Reset` SHALL replace the current draft with the defaults of all layers enabled and every configurable layer at `Med` (and `Med` World Size), without persisting it. Only `Confirm` SHALL persist the complete ordered catalog and regenerate the game so the confirmed profile is used by the new world; `Cancel` or closing the modal SHALL discard the draft without a write. In the V2 environment, `Confirm` SHALL write the complete validated catalog, including every pass's enabled state and Low, Med, or High density, to the local JSON settings file. In V2, the World Generation flow SHALL NOT write these settings to browser local storage. Other deployment modes MAY retain their existing persistence contract.

#### Scenario: Preview enabled state and density without committing
- **WHEN** a developer disables an optional pass or selects High for Water in the V2 environment
- **THEN** the draft and settings-map preview reflect both changes, while the local JSON settings file and browser local storage remain unchanged

#### Scenario: Confirm the complete V2 profile
- **WHEN** a developer confirms a draft containing changed enabled states and Low, Med, or High density selections in the V2 environment
- **THEN** the complete validated profile is written to the local JSON settings file, the game regenerates using it, and the World Generation flow does not write that profile to browser local storage

#### Scenario: Reset the draft to defaults
- **WHEN** a developer clicks `Reset` after changing enabled states or densities
- **THEN** every layer is enabled, every configurable layer is set to Med, World Size is Med, the preview updates, and the JSON settings file remains unchanged until Confirm

#### Scenario: Cancel a V2 draft
- **WHEN** a developer cancels or closes a draft with changed enabled states or densities
- **THEN** the local JSON settings file remains unchanged and reopening the modal shows the previously confirmed profile

#### Scenario: Restore the confirmed V2 profile
- **WHEN** the V2 environment starts with a valid local JSON profile
- **THEN** it restores every pass's enabled state and density before generating the world

#### Scenario: Preview a non-default density without committing it
- **WHEN** a developer selects High for Water while running the Vite development server
- **THEN** the settings-map preview redraws with High water distribution and no settings file write occurs

#### Scenario: Confirm a previewed density in local development
- **WHEN** a developer confirms a draft with High Water while running the Vite development server
- **THEN** the validated catalog is written locally and the restarted game uses High water distribution

#### Scenario: Cancel a previewed density
- **WHEN** a developer cancels a draft with an unconfirmed non-default density
- **THEN** the persisted catalog remains unchanged and reopening the modal shows the persisted selection

#### Scenario: Restore a deployed selection
- **WHEN** a deployed build starts with a valid persisted catalog
- **THEN** it restores each selected density before generating the world

### Requirement: Persistent generation-layer enablement
The World Generation tab SHALL provide persisted diagnostic enabled states for generation passes in addition to their densities. In development or an explicit supported diagnostic session, each pass row SHALL end with a label-free checkbox whose accessible label and tooltip state whether activating it will enable or disable that pass. Ground, Walkability, and Player Position SHALL remain checked and disabled. Existing persisted settings that omit enabled state SHALL normalize every pass to enabled, and disabling then re-enabling an optional pass SHALL retain its selected density. In the V2 environment, confirmed enabled states SHALL be read from and written to the local JSON settings file together with densities; they SHALL NOT be stored in browser local storage by this page. Normal production gameplay SHALL resolve every applicable pass as enabled regardless of disabled values in development-edited bundled data, legacy diagnostic persistence, or diagnostic-only URL arguments outside a diagnostic session. Normal production controls SHALL NOT offer disabling or display an ineffective disabled state. Diagnostic changes SHALL NOT silently become production configuration.

#### Scenario: Restore enabled states and densities from V2 JSON
- **WHEN** a V2 session opens with a valid local JSON catalog containing explicit enabled states and Low, Med, or High densities
- **THEN** each pass restores both values before the World Generation window and world generation use them

#### Scenario: Normalize an incomplete V2 catalog
- **WHEN** a V2 local JSON catalog omits enabled state or contains an invalid density
- **THEN** the missing enabled state defaults to enabled, the invalid density defaults to Med, and the normalized profile is used without reading a substitute value from this page's local storage

#### Scenario: Keep optional pass density through re-enable
- **WHEN** a developer disables and then re-enables an optional pass in V2
- **THEN** its Low, Med, or High density remains selected in the draft and is persisted with the enabled state only after Confirm

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
