# Spec Delta

## MODIFIED Requirements

### Requirement: Procedural generation settings window
The developer Windows controls SHALL provide a `Procedural` launcher that opens a modal titled `Procedural`. The modal SHALL expose a selected `World Generation` tab headed `Procedural World Generation Passes`, divide its content into equal-width options and preview panes, and remain reachable in supported portrait and landscape presentations. The options pane SHALL scroll independently and retain one bottom action-row parent: `Confirm` and `Cancel` SHALL align left, and an Overworld/Underworld preview toggle SHALL align right.

#### Scenario: Open procedural settings
- **WHEN** a developer activates the `Procedural` launcher
- **THEN** the Procedural modal displays its World Generation pass cards, Confirm and Cancel actions, and a settings-map preview above the game canvas

#### Scenario: Toggle the preview realm
- **WHEN** a developer toggles the preview from Overworld to Underworld
- **THEN** the settings-map preview redraws only the Underworld realm without changing the active game realm or persisted settings

### Requirement: Ordered pass density catalog
The World Generation tab SHALL display World Settings (1), Ground (2), Overground Walls (3), Underground Caves (4), Water (5), Walkability (6), Player Position (7), Object Distribution (8), Civilization Placement (9), and Character Distribution (10), in that order. World Settings SHALL display a World Size row with Low, Med, and High selections and a static Realm Count row. Object Distribution SHALL group its existing direct child distribution rows, Civilization Placement SHALL group its existing direct child rows, and Character Distribution SHALL group its existing direct child rows. Player Position SHALL display its centered baseline without a density control. Each configurable entry SHALL visibly identify its selected value.

#### Scenario: Render the World Generation catalog
- **WHEN** the Procedural modal opens
- **THEN** all ten ordered cards are visible or reachable by scrolling, World Settings is pass 1, Ground is pass 2, and the later cards retain their relative order

#### Scenario: Identify the selected world size
- **WHEN** World Settings displays a selected World Size
- **THEN** exactly one of Low, Med, or High is visibly identified as selected

#### Scenario: Render the current catalog
- **WHEN** the Procedural modal opens
- **THEN** all ten ordered cards are visible or reachable by scrolling, Object Distribution contains its individual controls, Civilization Placement contains its existing controls, Character Distribution contains its existing controls, and Player Position has no density control

#### Scenario: Select a Doors density
- **WHEN** a developer selects Low, Med, or High for Civilization Placement's Doors row in the Underworld preview
- **THEN** that selection becomes the unpersisted draft value for door-group distribution and the selected value is visibly identified

#### Scenario: Restore a legacy Civilization selection
- **WHEN** a valid persisted catalog contains the former single `civilization` density selection but no Doors selection
- **THEN** the catalog restores that density as the Doors selection and retains the complete current ordered catalog

## ADDED Requirements

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
