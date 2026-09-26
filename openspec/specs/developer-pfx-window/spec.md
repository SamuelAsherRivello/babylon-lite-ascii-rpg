# developer-pfx-window Specification

## Purpose
Provides a developer-only PFX inspection surface for selecting bundled particle effects and repeatedly placing one-shot previews in the active game world.

## Requirements

### Requirement: Draggable PFX window
The Windows developer tools SHALL expose a `PFX` launcher that opens a non-modal draggable window using the same title-bar and voluntary-close interaction model as Lighting.

#### Scenario: Open PFX
- **WHEN** the developer activates `PFX`
- **THEN** a PFX window opens while gameplay remains available and the window can be dragged by its title bar

### Requirement: Alphabetical effect selection
The PFX window SHALL display the available effect names as an alphabetical text list and SHALL allow exactly one effect to be selected for placement at a time.

#### Scenario: Select an effect
- **WHEN** the developer clicks an effect name
- **THEN** that effect becomes the armed placement selection and the PFX window remains open

### Requirement: Repeated click placement
While an effect is selected, a click on a valid game-world position SHALL spawn one non-looping instance at the corresponding grid coordinate and SHALL leave the PFX window open for another placement.

#### Scenario: Place multiple previews
- **WHEN** the developer selects an effect and clicks three valid world positions
- **THEN** three independent one-shot instances are spawned and the PFX window remains open after every click

### Requirement: Demo scope isolation
The PFX launcher and placement behavior SHALL be available only through developer tools and SHALL not create a gameplay action, alter world state, or replace a tile.

#### Scenario: Demo placement is non-gameplay
- **WHEN** a developer places an effect
- **THEN** the world generation, collision, occupancy, fog, and gameplay state remain unchanged
