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
The World Generation tab SHALL display World Settings (1), Ground (2), Overground Walls (3), Underground Caves (4), Water (5), Walkability (6), Player Position (7), Object Distribution (8), Civilization Placement (9), and Character Distribution (10), in that order. World Settings SHALL display a World Size row with Low, Med, and High selections and a static Realm Count row. Object Distribution SHALL group its existing direct child distribution rows, including a Chest row with Low, Med, and High Density & Distribution selections. Civilization Placement SHALL group its existing direct child rows, and Character Distribution SHALL group its existing direct child rows. Player Position SHALL display its centered baseline without a density control. Each configurable entry SHALL visibly identify its selected value.

#### Scenario: Render the World Generation catalog
- **WHEN** the Procedural modal opens
- **THEN** all ten ordered cards are visible or reachable by scrolling, World Settings is pass 1, Ground is pass 2, and the later cards retain their relative order

#### Scenario: Identify the selected world size
- **WHEN** World Settings displays a selected World Size
- **THEN** exactly one of Low, Med, or High is visibly identified as selected

#### Scenario: Render the current catalog
- **WHEN** the Procedural modal opens
- **THEN** all ten ordered cards are visible or reachable by scrolling, Object Distribution contains its individual controls including Chest, Civilization Placement contains its existing controls, Character Distribution contains its existing controls, and Player Position has no density control

#### Scenario: Select a Chest density
- **WHEN** a developer selects Low, Med, or High for the Chest row
- **THEN** that selection becomes the unpersisted draft value for chest distribution and the selected value is visibly identified

#### Scenario: Select a Doors density
- **WHEN** a developer selects Low, Med, or High for Civilization Placement's Doors row in the Underworld preview
- **THEN** that selection becomes the unpersisted draft value for door-group distribution and the selected value is visibly identified

#### Scenario: Restore a legacy Civilization selection
- **WHEN** a valid persisted catalog contains the former single `civilization` density selection but no Doors selection
- **THEN** the catalog restores that density as the Doors selection and retains the complete current ordered catalog

### Requirement: Chest preview markers
The settings-map preview SHALL render the closed-chest glyph at every deterministically selected Chest placement for its chosen realm and current draft profile.

#### Scenario: Preview Chest density
- **WHEN** a developer changes the Chest draft selection
- **THEN** the selected realm's preview SHALL redraw its chest markers with the corresponding one, two, or three placement count

### Requirement: Draft selection preview, confirmation, and regeneration
The system SHALL initialize every pass at `Med` when no valid setting exists. Selecting a density SHALL update an unpersisted complete draft catalog and redraw the settings-map preview using that draft. Only `Confirm` SHALL persist the complete ordered catalog and regenerate the game so the confirmed profile is used by the new world; `Cancel` or closing the modal SHALL discard the draft without a write. Local Vite development SHALL persist the catalog to a validated local settings file; deployed builds SHALL persist it in browser local storage.

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
