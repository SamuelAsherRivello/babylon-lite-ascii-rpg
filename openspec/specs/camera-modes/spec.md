# camera-modes Specification

## Purpose

Provides explicit camera behavior choices for following the player, allowing
movement within a centered dead zone, or wrapping the player across screen
edges without following during ordinary movement.

## Requirements

### Requirement: Camera mode setting

The Settings UI SHALL expose one persisted camera mode control directly beneath
Fullscreen. The control SHALL cycle through exactly these labels in order:
`Camera Center`, `Camera Deadzone`, and `Camera Lock`.

#### Scenario: Default camera mode

- **WHEN** a new game is opened without a saved camera preference
- **THEN** the Settings UI SHALL show `Camera Center`

#### Scenario: Camera mode cycles

- **WHEN** the user activates the camera mode control
- **THEN** the label SHALL advance from `Camera Center` to `Camera Deadzone`,
  from `Camera Deadzone` to `Camera Lock`, or from `Camera Lock` to
  `Camera Center`

#### Scenario: Camera mode persists

- **WHEN** the user selects a camera mode and reloads the game
- **THEN** the same camera mode SHALL be selected and applied

### Requirement: Camera Center behavior

`Camera Center` SHALL continuously follow the player so the player occupies the
center cell of the visible viewport whenever the world has sufficient space;
the viewport origin SHALL clamp at world boundaries.

#### Scenario: Centered following

- **WHEN** the player successfully moves in a valid world cell while the active
  mode is `Camera Center`
- **THEN** the visible world SHALL shift as needed and the player SHALL remain
  at the viewport center unless clamping is required by a world boundary

#### Scenario: Center mode at a boundary

- **WHEN** centered following would require rendering outside the world
- **THEN** the viewport origin SHALL clamp to the valid world range and the
  player SHALL remain on its actual world cell

### Requirement: Camera Deadzone behavior

`Camera Deadzone` SHALL allow the player to move without shifting the viewport
while the player remains inside a centered rectangular dead zone. The dead zone
SHALL extend 20% of the visible viewport width from the center horizontally and
20% of the visible viewport height from the center vertically, independent of
zoom; it SHALL be reduced safely for smaller viewports.

#### Scenario: Movement inside dead zone

- **WHEN** the player moves to a cell still inside the active dead zone
- **THEN** the viewport origin SHALL remain unchanged

#### Scenario: Movement reaches dead-zone edge

- **WHEN** the player moves beyond the active dead zone edge
- **THEN** the viewport SHALL shift in the movement direction enough to return
  the player to the dead-zone boundary while keeping the visible region valid

#### Scenario: Dead zone remains viewport-relative across zoom

- **WHEN** the user changes zoom while `Camera Deadzone` is active
- **THEN** the dead zone SHALL be recalculated as 20% of the current visible
  width and height, and the player/world position SHALL not be reset

### Requirement: Camera Lock wrap behavior

`Camera Lock` SHALL keep the viewport origin fixed during ordinary movement. If
the player moves one step beyond a visible screen edge into a valid wrapped
position, the game SHALL shift the visible world and place the player at the
opposite screen edge in the corresponding direction.

#### Scenario: Wrap upward

- **WHEN** the player moves one step beyond the top visible row in `Camera Lock`
- **THEN** the player SHALL appear entering through the bottom visible row and
  the visible world SHALL shift consistently with that wrap

#### Scenario: Wrap downward

- **WHEN** the player moves one step beyond the bottom visible row in `Camera Lock`
- **THEN** the player SHALL appear entering through the top visible row

#### Scenario: Wrap horizontally

- **WHEN** the player moves one step beyond the left or right visible column in
  `Camera Lock`
- **THEN** the player SHALL appear entering through the opposite horizontal edge

#### Scenario: Lock mode at a non-wrappable world boundary

- **WHEN** a wrap target is outside the generated world or is not walkable
- **THEN** the player SHALL remain on its current world cell and world time
  SHALL not advance
