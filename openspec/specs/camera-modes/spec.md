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
opposite screen edge in the corresponding direction. The resulting viewport
render SHALL reconcile every screen cell, including cells that are not
discovered, so no glyph from the previous viewport composition remains visible.

#### Scenario: Wrap upward

- **WHEN** the player moves one step beyond the top visible row in `Camera Lock`
- **THEN** the player SHALL appear entering through the bottom visible row, the
  visible world SHALL shift consistently with that wrap, and no stale glyph
  SHALL remain in a screen cell whose world content is undiscovered

#### Scenario: Wrap downward

- **WHEN** the player moves one step beyond the bottom visible row in `Camera Lock`
- **THEN** the player SHALL appear entering through the top visible row and no
  stale glyph SHALL remain in a screen cell whose world content is undiscovered

#### Scenario: Wrap horizontally

- **WHEN** the player moves one step beyond the left or right visible column in
  `Camera Lock`
- **THEN** the player SHALL appear entering through the opposite horizontal edge
  and no stale glyph SHALL remain in a screen cell whose world content is
  undiscovered

#### Scenario: Lock mode at a non-wrappable world boundary

- **WHEN** a wrap target is outside the generated world or is not walkable
- **THEN** the player SHALL remain on its current world cell and world time
  SHALL not advance

### Requirement: Camera recalculation after viewport resize

The active camera SHALL recalculate its visible world origin whenever the
effective game viewport dimensions change because of browser resize,
orientation change, canvas layout change, or presentation aspect change. The
active camera SHALL also be considered whenever a playable world first becomes
available, the active camera mode changes, the active realm changes, the
displayed game zoom changes, the player successfully moves, or game-owned
logic relocates the player without ordinary step movement. The recalculation
SHALL use the current camera mode, current player world cell, active world,
and current visible width and height; keep the player on the authoritative
world cell; clamp the resulting origin to valid world bounds; and render the
new visible region without stale cells from the previous viewport.

#### Scenario: Initial playable world resolves the active camera

- **WHEN** world generation completes and the first playable player cell is
  established
- **THEN** the visible world origin SHALL be calculated with the selected
  camera mode before the first playable game view is rendered

#### Scenario: Camera mode selection recalculates the active view

- **WHEN** the active camera mode changes while a playable world and player
  cell exist
- **THEN** the visible world origin SHALL be recalculated using the newly
  selected camera mode without changing the player world cell

#### Scenario: Realm transfer resolves the destination camera

- **WHEN** the active realm changes through stairs, settings, or another
  game-owned realm-transfer path
- **THEN** the destination realm SHALL render from a camera origin resolved for
  the destination player cell, active camera mode, destination world bounds,
  and current viewport dimensions before the transition reveals it

#### Scenario: Zoom change recalculates the active camera

- **WHEN** the displayed game zoom changes while a playable world and player
  cell exist
- **THEN** the camera SHALL recalculate using the active mode and the zoom's
  effective visible dimensions, keep the player on the same world cell, and
  clamp the result to valid world bounds

#### Scenario: Aspect mode recalculates the active camera

- **WHEN** the persisted presentation aspect changes between landscape and
  portrait while a playable world and player cell exist
- **THEN** the camera SHALL recalculate using the active mode and the resulting
  game viewport dimensions, regardless of whether a browser resize event also
  fires

#### Scenario: Center camera recalculates after a landscape-to-portrait resize

- **WHEN** the active camera mode is `Camera Center` and the game canvas
  changes from a landscape viewport to a portrait viewport
- **THEN** the camera SHALL recalculate using the portrait dimensions and keep
  the player centered whenever the world has sufficient space, otherwise
  clamping the origin to the valid world range

#### Scenario: Deadzone camera recalculates its viewport-relative deadzone

- **WHEN** the active camera mode is `Camera Deadzone` and the canvas width or
  height changes
- **THEN** the camera SHALL recalculate the deadzone from 20% of the new
  visible width and height, preserve the player’s world cell, and keep the
  resulting viewport within the generated world

#### Scenario: Lock camera preserves the player’s screen placement when valid

- **WHEN** the active camera mode is `Camera Lock` and the canvas dimensions
  change while the player and current view remain valid
- **THEN** the camera SHALL recalculate for the new viewport without moving the
  player’s world cell and SHALL preserve the player’s existing screen-relative
  placement when possible, subject to valid world bounds

#### Scenario: Resize before a playable world exists

- **WHEN** the canvas dimensions change while the game is generating or before
  a playable world and player cell have been initialized
- **THEN** the resize handling SHALL update the viewport safely without
  attempting to calculate a camera origin from missing world state

#### Scenario: Movement considers the active camera mode

- **WHEN** the player successfully moves to a new world cell
- **THEN** the visible world origin SHALL be resolved through the active camera
  mode before the movement render is presented

#### Scenario: Programmatic player relocation considers the active camera mode

- **WHEN** game-owned behavior places the player on a new world cell without
  ordinary step movement
- **THEN** the visible world origin SHALL be resolved through the active camera
  mode for that new player cell before the next gameplay render is presented

#### Scenario: Resized render reconciles the complete visible region

- **WHEN** a resize, aspect change, zoom change, realm change, camera mode
  change, movement, or player relocation changes the set of visible rows,
  columns, or world cells
- **THEN** the next game render SHALL reconcile every visible screen cell with
  the recalculated camera view, including undiscovered cells, so content from
  the previous viewport cannot remain visible

### Requirement: Camera-independent startup placement

Before the first visible world render after a game restart, the game SHALL
position the player's cell at the dead center of the visible viewport whenever
the generated world has sufficient space. This startup placement SHALL be the
same for Camera Center, Camera Deadzone, and Camera Lock; the selected camera
mode SHALL control movement behavior only after startup placement is complete.
At a world boundary, the viewport origin SHALL clamp to the valid world range
while the player remains on its actual generated start cell.

#### Scenario: Center mode starts centered

- **WHEN** the game restarts with Camera Center selected
- **THEN** the first visible world render places the player in the viewport's
  center cell

#### Scenario: Deadzone mode starts centered

- **WHEN** the game restarts with Camera Deadzone selected
- **THEN** the first visible world render places the player in the viewport's
  center cell before deadzone movement behavior begins

#### Scenario: Lock mode starts centered

- **WHEN** the game restarts with Camera Lock selected
- **THEN** the first visible world render places the player in the viewport's
  center cell before lock/wrap movement behavior begins

#### Scenario: Startup placement does not change the world cell

- **WHEN** the game restarts in any supported camera mode
- **THEN** the player's world x/y cell equals the generated start cell
- **AND** one valid movement input changes exactly one corresponding world
  coordinate by one cell
