# Spec Delta

## MODIFIED Requirements

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
