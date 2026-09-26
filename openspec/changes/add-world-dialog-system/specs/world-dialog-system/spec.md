# Spec Delta

## Purpose

Provides readable and choice-based conversations triggered by world collisions, with modal NPC interaction and non-modal environmental messages while preserving gameplay-layer ownership of state.

## ADDED Requirements

### Requirement: Cardinal world entities can open dialogs

Signs and friendly NPCs SHALL trigger their configured dialog when the player attempts to walk into their adjacent cell from any cardinal direction. Dialog presentation SHALL be initiated by the gameplay layer and SHALL not require a separate pointer-only interaction path.

#### Scenario: Player enters a sign from each cardinal direction
- **WHEN** the player attempts to move up, down, left, or right into a Welcome Sign
- **THEN** the sign SHALL trigger its configured Welcome Sign dialog without moving the player into the sign cell

#### Scenario: Player enters an NPC from each cardinal direction
- **WHEN** the player attempts to move up, down, left, or right into an available NPC
- **THEN** the NPC SHALL trigger its configured party-recruitment dialog without moving the player into the NPC cell

### Requirement: Modal dialogs block gameplay

When `isModal` is true, the dialog SHALL use the existing window presentation, render a backdrop that darkens the world, block gameplay input, and provide no close button. Gameplay SHALL resume only after a valid dialog choice is accepted.

#### Scenario: NPC party dialog blocks the world
- **WHEN** the player opens the NPC party-recruitment dialog
- **THEN** the world SHALL remain visible behind a dark backdrop, movement and gameplay actions SHALL be blocked, and no close button SHALL be shown

#### Scenario: Modal dialog resumes after selection
- **WHEN** the player accepts either the Yes or No choice
- **THEN** the dialog SHALL close, return the selected value to the gameplay layer, and restore gameplay input

### Requirement: Non-modal dialogs float without blocking gameplay

When `isModal` is false, the dialog SHALL render as a floating world overlay, SHALL not pause gameplay, and SHALL use the current available UI space chosen for that dialog.

#### Scenario: Welcome Sign displays as a floating overlay
- **WHEN** the player triggers a Welcome Sign
- **THEN** the sign message SHALL appear over the world without a backdrop, without blocking movement, and in the best current available UI space

### Requirement: Dialog placement uses current available UI spaces

The dialog presentation SHALL derive ranked available UI spaces from the current visible HUD bounds and presentation-only exclusion bounds for the player and active enemies. Both Welcome Sign dialogs and NPC dialogs SHALL use the highest-ranked visible space that fits the dialog; when no fully clear space exists, they SHALL use a readable in-viewport fallback. React SHALL consume published presentation bounds and SHALL NOT inspect NPC or world records to determine placement.

#### Scenario: Dialog avoids current HUD and world exclusions
- **WHEN** a visible HUD element, the player, or an active enemy occupies a candidate dialog area
- **THEN** the evaluator SHALL prefer another visible candidate area when one is available

#### Scenario: NPC dialog uses the shared placement result
- **WHEN** the player opens an NPC party-recruitment dialog
- **THEN** the modal dialog SHALL use the current available UI space while retaining its backdrop and gameplay input lock

#### Scenario: Crowded view has a readable fallback
- **WHEN** no candidate area avoids every visible exclusion
- **THEN** the dialog SHALL remain fully within the viewport at a readable constrained placement

### Requirement: Dialog choices support pointer and directional input

Choice dialogs SHALL support mouse or touch selection. Keyboard input SHALL support Up and Down to move the highlighted choice and Right to accept the highlighted choice. The first choice SHALL be highlighted initially, and a single-choice dialog SHALL highlight its only choice automatically.

#### Scenario: Player navigates NPC choices with arrows
- **WHEN** the NPC dialog is open and the player presses Up or Down
- **THEN** the highlighted choice SHALL move among the available responses without accepting one

#### Scenario: Player accepts with Right
- **WHEN** a choice is highlighted and the player presses Right
- **THEN** the highlighted choice SHALL be accepted and its value SHALL be returned to gameplay

#### Scenario: Player selects with mouse or touch
- **WHEN** the player clicks or taps a visible choice
- **THEN** that choice SHALL be accepted and its value SHALL be returned to gameplay

### Requirement: Welcome Sign is stateless and rereadable

The Welcome Sign SHALL use the active-palette-backed `⚑` glyph and SHALL present deterministic text in the form `Welcome to town <number>`. Civilization sign generation SHALL place one sign within 50 grid units of every individual stair, including both stairs in each paired connection. Reading a sign SHALL not mutate sign state, and the player SHALL be able to trigger the same message repeatedly.

#### Scenario: Player rereads the Welcome Sign
- **WHEN** the player walks into the same Welcome Sign after reading it previously
- **THEN** the Welcome Sign SHALL display its message again without a visited, consumed, or dismissed state

#### Scenario: Town number is stable for a generated world
- **WHEN** the same world seed and sign identity are loaded again during world generation
- **THEN** the sign SHALL display the same town number rather than choosing a new number per interaction or render

#### Scenario: Civilization generates one sign per stair
- **WHEN** a realm completes civilization stair generation
- **THEN** every individual stair SHALL have one associated Welcome Sign within 50 grid units on a valid unoccupied walkable cell

#### Scenario: Sign glyph is palette-backed
- **WHEN** a generated Welcome Sign is rendered
- **THEN** it SHALL use the `⚑` glyph and that glyph SHALL exist in the active editable palette

### Requirement: NPC recruitment state is gameplay-owned

Each recruitable NPC SHALL own a runtime recruitment state. An NPC that has not been accepted SHALL remain available for repeated conversations. Accepting the Yes choice SHALL mark that NPC recruited, make it passable, and SHALL not add party movement, party commands, or party UI in this release.

#### Scenario: Player declines recruitment
- **WHEN** the player selects No in the NPC party dialog
- **THEN** the NPC SHALL remain available and solid for a later cardinal interaction

#### Scenario: Player accepts recruitment
- **WHEN** the player selects Yes in the NPC party dialog
- **THEN** the NPC SHALL be marked recruited, SHALL become passable, and SHALL not open the party dialog again

### Requirement: Dialog state remains client-only

Dialog presentation state and NPC recruitment state SHALL remain in the current client game instance for this release. A browser refresh SHALL create a newly generated client state rather than requiring persistence or server synchronization.

#### Scenario: Refresh creates a fresh dialog state
- **WHEN** the browser is refreshed after reading a sign or recruiting an NPC
- **THEN** the new game instance SHALL initialize its dialog and generated-world state according to the normal world-generation inputs
