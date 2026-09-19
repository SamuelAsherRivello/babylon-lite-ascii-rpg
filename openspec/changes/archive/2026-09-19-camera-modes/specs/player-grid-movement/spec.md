# Spec Delta

## MODIFIED Requirements

### Requirement: Screen-sized world boundaries

The world SHALL be independent of the viewport, and the Babylon Lite renderer
SHALL show only cells within the current logical viewport. The active camera
mode SHALL determine how the visible origin responds to player movement:
`Camera Center` SHALL follow the player toward the center, `Camera Deadzone`
SHALL follow only after the player reaches its dead-zone edge, and `Camera Lock`
SHALL keep the origin fixed during ordinary movement and apply the specified
screen-edge wrapping behavior. The outermost row and column of the generated
world SHALL remain non-walkable `W` cells.

#### Scenario: Movement at a world edge

- **WHEN** a movement input targets a cell outside the world or targets an
  outer-border `W` cell
- **THEN** the player SHALL remain in the current cell and SHALL not render
  beyond the world boundary in any camera mode

#### Scenario: Movement outside the visible viewport in Camera Center

- **WHEN** a movement input targets a valid walkable cell outside the current
  logical viewport while `Camera Center` is active
- **THEN** the player SHALL move to that world cell and the viewport SHALL
  follow toward the player center, subject to world clamping

#### Scenario: Movement outside the visible viewport

- **WHEN** a movement input targets a valid walkable cell outside the current
  logical viewport while `Camera Lock` is active
- **THEN** the player SHALL move to that world cell without moving the viewport
  to follow the player, unless the movement crosses a visible edge and invokes
  the specified wrap behavior

#### Scenario: Movement within the Camera Deadzone

- **WHEN** a movement input targets a valid walkable cell inside the active
  deadzone
- **THEN** the player SHALL move to that world cell without changing the
  viewport origin

#### Scenario: Movement beyond the Camera Lock screen edge

- **WHEN** a movement input crosses a visible screen edge while `Camera Lock` is
  active and the corresponding wrapped destination is valid and walkable
- **THEN** the player SHALL move to the wrapped destination and the renderer
  SHALL place the player at the opposite visible edge

#### Scenario: Resize near a visible boundary

- **WHEN** the browser resizes
- **THEN** the player SHALL remain on its world cell, the selected camera mode
  SHALL recalculate its visible origin or wrap geometry, and the renderer SHALL
  not render beyond the world boundary

#### Scenario: Movement at an edge

- **WHEN** a movement input targets a cell outside the logical viewport and
  outside the world
- **THEN** the player SHALL remain in its current cell and SHALL not render
  beyond the screen or world boundary

#### Scenario: Resize near a boundary

- **WHEN** the browser resizes and the current player cell is no longer valid
  for the new logical viewport but remains inside the world
- **THEN** the player SHALL remain on its world cell and the selected camera
  mode SHALL resolve an origin that is clamped to valid world coordinates
