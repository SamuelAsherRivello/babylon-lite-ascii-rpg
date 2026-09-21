# Spec Delta

## ADDED Requirements

### Requirement: Camera recalculation after viewport resize

The active camera SHALL recalculate its visible world origin whenever the
effective game viewport dimensions change because of browser resize,
orientation change, or canvas layout change. The recalculation SHALL use the
current camera mode and the new visible width and height, keep the player on
the same world cell, clamp the resulting origin to valid world bounds, and
render the new visible region without stale cells from the previous viewport.

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

#### Scenario: Resized render reconciles the complete visible region

- **WHEN** a resize changes the set of visible rows or columns
- **THEN** the next game render SHALL reconcile every visible screen cell with
  the recalculated camera view, including undiscovered cells, so content from
  the previous viewport cannot remain visible
