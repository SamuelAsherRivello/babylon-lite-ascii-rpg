# procedural-generation-settings Specification

## Purpose
Provides developers with ordered, persistent density and distribution controls for every procedural world-generation pass.

## Requirements

### Requirement: Procedural generation settings window
The developer Windows controls SHALL provide a `Procedural` launcher that opens a modal titled `Procedural`. The modal SHALL expose a selected `Level Generation` tab headed `Procedural Level Generation Passes`, divide its content into equal-width options and preview panes, and remain reachable in supported portrait and landscape presentations. The options pane SHALL scroll independently and retain one bottom action-row parent: `Confirm` and `Cancel` SHALL align left, and an Overworld/Underworld preview toggle SHALL align right.

#### Scenario: Open procedural settings
- **WHEN** a developer activates the `Procedural` launcher
- **THEN** the Procedural modal displays its Level Generation pass cards, Confirm and Cancel actions, and a settings-map preview above the game canvas

#### Scenario: Toggle the preview realm
- **WHEN** a developer toggles the preview from Overworld to Underworld
- **THEN** the settings-map preview redraws only the Underworld realm without changing the active game realm or persisted settings

### Requirement: Ordered pass density catalog
The Level Generation tab SHALL display cards in this order: Ground (1), Cave / Walls (2), Water (3), Walkability (4), Player Position (5), Object Distribution (6), Civilization (7), and Enemy Spawner Distribution (8). The Object Distribution card SHALL group separate Heart, Trap, and Torch rows, each with Low, Med, and High Density & Distribution selections. Player Position SHALL display its centered baseline without a density control. Each configurable entry SHALL visibly identify its selected value.

#### Scenario: Render the current catalog
- **WHEN** the Procedural modal opens
- **THEN** all eight ordered cards are visible or reachable by scrolling, with individual controls for every configurable entry and no density control for Player Position

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
