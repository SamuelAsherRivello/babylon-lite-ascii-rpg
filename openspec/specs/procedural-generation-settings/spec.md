# procedural-generation-settings Specification

## Purpose
Provides developers with ordered, persistent density and distribution controls for every procedural world-generation pass.

## Requirements

### Requirement: Procedural generation settings window
The developer Windows controls SHALL provide a `Procedural` launcher that opens a modal titled `Procedural`. The modal SHALL expose a selected `World Generation` tab headed `Procedural World Generation Passes`, divide its content into equal-width options and preview panes, and remain reachable in supported portrait and landscape presentations. The options pane SHALL scroll independently and retain one bottom action-row parent: `Confirm` and `Cancel` SHALL align left, and an Overworld/Underworld preview toggle SHALL align right.

#### Scenario: Open procedural settings
- **WHEN** a developer activates the `Procedural` launcher
- **THEN** the Procedural modal displays its World Generation pass cards, Confirm and Cancel actions, and a settings-map preview above the game canvas

#### Scenario: Toggle the preview realm
- **WHEN** a developer toggles the preview from Overworld to Underworld
- **THEN** the settings-map preview redraws only the Underworld realm without changing the active game realm or persisted settings

### Requirement: Ordered pass density catalog
The Level Generation tab SHALL display cards in this order: Ground (1), Overground Walls (2), Underground Caves (3), Water (4), Walkability (5), Player Position (6), Object & NPC Distribution (7), Civilization (8), and Enemy Spawner Distribution (9). The Object & NPC Distribution card SHALL group separate Heart, Trap, Torch, NPC, and Fireplace rows, each with Low, Med, and High Density & Distribution selections. The Civilization card SHALL use the same grouped-row presentation and contain independent `Doors` and `Homes` rows, each with Low, Med, and High Density & Distribution selections. Doors SHALL remain Underworld-only. Homes SHALL be Overworld-only and use the same quarter/current/double group-chance mapping as Doors. Player Position SHALL display its centered baseline without a density control. Each configurable entry SHALL visibly identify its selected value.

#### Scenario: Render the World Generation catalog
- **WHEN** the Procedural modal opens
- **THEN** all ten ordered cards are visible or reachable by scrolling, World Settings is pass 1, Ground is pass 2, and the later cards retain their relative order

#### Scenario: Identify the selected world size
- **WHEN** World Settings displays a selected World Size
- **THEN** exactly one of Low, Med, or High is visibly identified as selected

#### Scenario: Render the current catalog
- **WHEN** the Procedural modal opens
- **THEN** all nine ordered cards are visible or reachable by scrolling, Layer 7 contains its individual Object & NPC controls, Layer 8 contains independent Doors and Homes controls, and Player Position has no density control

#### Scenario: Select a Doors density
- **WHEN** a developer selects Low, Med, or High for Civilization's Doors row in the Underworld preview
- **THEN** that selection becomes the unpersisted draft value for door-group distribution and the selected value is visibly identified

#### Scenario: Select a Homes density
- **WHEN** a developer selects Low, Med, or High for Civilization's Homes row in the Overworld preview
- **THEN** that selection becomes the unpersisted draft value for Home-group distribution, redraws the preview, and remains independent of Doors

#### Scenario: Select a Chest density
- **WHEN** a developer selects Low, Med, or High for the Chest row
- **THEN** that selection becomes the unpersisted draft value for chest distribution and the selected value is visibly identified

#### Scenario: Preview a Home group
- **WHEN** the Overworld settings-map preview accepts a Home group
- **THEN** it displays exactly one `^` Home marker for that group without mutating preview terrain, active realm state, or persisted settings

#### Scenario: Restore a legacy Civilization selection
- **WHEN** a valid persisted catalog contains the former single `civilization` density selection but no Doors selection
- **THEN** the catalog restores that density as the Doors selection, initializes the missing Homes selection to Med, and retains the complete current ordered catalog

### Requirement: Chest preview markers
The settings-map preview SHALL render the closed-chest glyph at every deterministically selected Chest placement for its chosen realm and current draft profile.

#### Scenario: Preview Chest density
- **WHEN** a developer changes the Chest draft selection
- **THEN** the selected realm's preview SHALL redraw its chest markers with the corresponding one, two, or three placement count

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

### Requirement: Compound layer enablement controls
In development or an explicit supported diagnostic session, the Object Distribution, Civilization Placement, and Character Distribution cards SHALL each provide a parent checkbox that controls only their direct child passes. A parent checkbox SHALL be checked when all children are enabled, unchecked when all are disabled, and expose a mixed state when children differ; toggling it SHALL enable or disable all of its direct children without changing unrelated optional passes. Normal production SHALL follow the all-enabled policy and SHALL NOT expose parent controls that imply production layers can be disabled.

#### Scenario: Disable a compound layer
- **WHEN** a developer disables the Civilization Placement parent checkbox in a diagnostic session
- **THEN** Stairs, Doors, and Homes become disabled in the draft while Enemy Spawner Distribution retains its existing enabled state

#### Scenario: Represent individually mixed children
- **WHEN** a diagnostic compound card has both enabled and disabled child passes
- **THEN** its parent checkbox exposes a mixed state and no child selection is changed until the developer toggles that parent

### Requirement: Persistent world-size draft, preview, and confirmation
The World Generation tab SHALL initialize World Size to Med when no valid persisted value exists. Low SHALL represent `128 x 128`, Med SHALL represent `256 x 256`, and High SHALL represent `512 x 512`, each dimension applying independently to each generated realm. Hovering or otherwise exposing help for a World Size selection SHALL identify that selection's exact dimensions. Selecting a World Size SHALL update the unpersisted complete draft catalog and redraw the settings-map preview using that draft. Only `Confirm` SHALL persist the complete ordered catalog and regenerate the game using the confirmed size; `Cancel` or closing the modal SHALL discard the draft without a write. Local Vite development SHALL persist the catalog to a validated local settings file; deployed builds SHALL persist it in browser local storage.

#### Scenario: Preview an unconfirmed world size
- **WHEN** a developer selects High World Size while running the Vite development server
- **THEN** the settings-map preview redraws using `512 x 512` per realm and no settings file write occurs

#### Scenario: Confirm a world size in local development
- **WHEN** a developer confirms a draft with Low World Size while running the Vite development server
- **THEN** the validated catalog is written locally and the restarted game generates both realms at `128 x 128`

#### Scenario: Restore an invalid or absent world size
- **WHEN** persisted generation settings omit World Size or contain an unsupported value
- **THEN** World Size restores to Med and the game generates both realms at `256 x 256`

### Requirement: Production medium baseline is independent of debug defaults
With no valid explicit user settings, production SHALL initialize Med World Size and Med density for every configurable feature, with all applicable features enabled. Development-edited bundled densities SHALL NOT override this default. Existing valid explicit world-size and density choices SHALL retain their persistence and Confirm/Cancel semantics.

#### Scenario: Fresh production session
- **WHEN** production starts without valid persisted generation preferences
- **THEN** both realms use 256 x 256 cells and every configurable feature uses Med density with effective enablement true

#### Scenario: Restore explicit High size
- **WHEN** production starts with a valid user preference for High World Size or non-Med density
- **THEN** it restores those explicit choices while retaining all applicable layers
