# Spec Delta

## MODIFIED Requirements

### Requirement: Full-screen logical rendering

The game SHALL render through the Babylon Lite game layer into the full browser
viewport with no outer margins. The logical viewport dimensions SHALL be the
current screen dimensions divided by the configured `upscale` value, which
defaults to `1.0`. The game SHALL support a default grid-cell width of `32`
logical units and a default grid-cell height of `32` logical units. A bounded
zoom value SHALL scale both grid-cell dimensions relative to the default zoom
value of `5` without changing the full-screen output.

#### Scenario: Default one-to-one rendering

- **WHEN** the browser viewport is `1280 x 720`, `upscale` is `1.0`, and zoom
  is `5`
- **THEN** the logical viewport SHALL be `1280 x 720`, each grid cell SHALL
  occupy `32 x 32` logical units, and the visible grid SHALL contain `40`
  columns and `22` rows

#### Scenario: Zoomed-out rendering

- **WHEN** the browser viewport is `1280 x 720`, `upscale` is `1.0`, and zoom
  is `1`
- **THEN** each grid cell SHALL occupy `6.4 x 6.4` logical units and the
  visible grid SHALL contain `200` columns and `112` rows

#### Scenario: Upscaled logical rendering

- **WHEN** the browser viewport is `1280 x 720`, `upscale` is `2.0`, and zoom
  is `5`
- **THEN** the logical viewport SHALL be `640 x 360`, each grid cell SHALL
  occupy `32 x 32` logical units, and the logical output SHALL be scaled to
  fill the `1280 x 720` screen

#### Scenario: Zoomed-in rendering

- **WHEN** the browser viewport is `1280 x 720`, `upscale` is `1.0`, and zoom
  is `10`
- **THEN** each grid cell SHALL occupy `64 x 64` logical units and the visible
  grid SHALL contain `20` columns and `11` rows

#### Scenario: Browser resize

- **WHEN** the browser viewport changes size
- **THEN** the screen dimensions, logical dimensions, and rendered grid SHALL
  update to fill the new viewport without adding margins, while retaining the
  current zoom value and player world position

### Requirement: Screen-sized world boundaries

The world SHALL be independent of the viewport, but the Babylon Lite renderer
SHALL show only cells within the current logical viewport and the player SHALL
not move outside the fixed world or to a non-walkable cell. The outermost row
and column of the world SHALL be non-walkable `W` cells.

#### Scenario: Movement at a world edge

- **WHEN** a movement input targets a cell outside the world or targets an
  outer-border `W` cell
- **THEN** the player SHALL remain in the current cell and SHALL not render
  beyond the world boundary

#### Scenario: Movement outside the visible viewport

- **WHEN** a movement input targets a valid walkable cell outside the current
  logical viewport
- **THEN** the player SHALL move to that world cell without moving the viewport
  to follow the player

#### Scenario: Movement at an edge

- **WHEN** a movement input targets a cell outside the logical viewport and
  outside the world
- **THEN** the player SHALL remain in the current cell and SHALL not render
  beyond the screen or world boundary

#### Scenario: Resize near a visible boundary

- **WHEN** the browser resizes and the current player cell is outside the new
  visible area but remains valid in the world
- **THEN** the player SHALL remain on its world cell and the renderer SHALL
  update the visible portion without moving it to an invalid cell

#### Scenario: Resize near a boundary

- **WHEN** the browser resizes and the current player cell is no longer valid
  for the new logical viewport but remains inside the world
- **THEN** the player SHALL remain on its world cell and the fixed viewport
  origin SHALL be clamped to valid world coordinates
