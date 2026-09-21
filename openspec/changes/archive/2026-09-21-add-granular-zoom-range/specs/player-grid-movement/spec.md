# Spec Delta

## MODIFIED Requirements

### Requirement: Full-screen logical rendering
The game SHALL render through the Babylon Lite game layer into the full browser viewport with no outer margins. The logical viewport dimensions SHALL be the current screen dimensions divided by the configured `upscale` value, which defaults to `1.0`. The game SHALL support the displayed zoom range `1`–`10`, with displayed zoom `1` using 0.1× the current zoom-1 scale, displayed zoom `10` using the current zoom-10 scale, and displayed zooms `2`–`9` evenly distributed additively between those endpoints.

#### Scenario: Farthest zoom
- **WHEN** the browser viewport is `1280 x 720`, `upscale` is `1.0`, and displayed zoom is `1`
- **THEN** the visible grid SHALL expand by the remapped effective scale and rendering SHALL remain bounded by the world dimensions

#### Scenario: Closest zoom
- **WHEN** the browser viewport is `1280 x 720`, `upscale` is `1.0`, and displayed zoom is `10`
- **THEN** the visible grid SHALL match the current zoom-10 effective view

#### Scenario: Default one-to-one rendering
- **WHEN** the browser viewport is `1280 x 720`, `upscale` is `1.0`, and the migrated default is active
- **THEN** the logical viewport SHALL fill the screen at the preserved default effective scale

#### Scenario: Zoomed-out rendering
- **WHEN** displayed zoom is below the migrated default
- **THEN** cells SHALL become smaller and the visible grid SHALL contain more columns and rows

#### Scenario: Upscaled logical rendering
- **WHEN** `upscale` is `2.0`
- **THEN** logical output SHALL be scaled to fill the same browser viewport

#### Scenario: Zoomed-in rendering
- **WHEN** displayed zoom is `10`
- **THEN** cells SHALL use the current closest effective scale

#### Scenario: Browser resize
- **WHEN** the browser viewport changes size
- **THEN** the screen dimensions, logical dimensions, and rendered grid SHALL update to fill the new viewport without adding margins, while retaining the current displayed zoom, effective scale, and player world position

### Requirement: Screen-sized world boundaries
The world SHALL be independent of the viewport, and the Babylon Lite renderer SHALL show only cells within the current logical viewport. The active camera mode SHALL determine how the visible origin responds to player movement at every remapped displayed zoom, including the larger far-zoom viewport. The outermost row and column of the generated world SHALL remain non-walkable `W` cells, and the renderer SHALL never synthesize or render cells outside the world to fill a viewport.

#### Scenario: Movement at a far-zoom world edge
- **WHEN** displayed zoom `1` makes the visible viewport reach a world edge
- **THEN** the player SHALL remain constrained by valid walkable cells and the renderer SHALL clamp the visible origin without rendering beyond the border

#### Scenario: Movement at a world edge
- **WHEN** movement targets outside the world or a border wall
- **THEN** the player SHALL remain in its current cell

#### Scenario: Movement outside the visible viewport in Camera Center
- **WHEN** movement targets a valid cell outside the viewport in Camera Center mode
- **THEN** the player SHALL move and the viewport SHALL follow subject to world clamping

#### Scenario: Movement outside the visible viewport
- **WHEN** movement targets a valid cell outside the viewport in Camera Lock mode
- **THEN** the player SHALL move without ordinary viewport following

#### Scenario: Movement within the Camera Deadzone
- **WHEN** movement remains inside the active deadzone
- **THEN** the viewport origin SHALL remain unchanged

#### Scenario: Movement beyond the Camera Lock screen edge
- **WHEN** movement crosses a visible edge in Camera Lock mode and the wrapped destination is valid
- **THEN** the player SHALL move to the wrapped destination and appear at the opposite edge

#### Scenario: Movement at an edge
- **WHEN** movement targets outside both the viewport and world
- **THEN** the player SHALL remain in its current cell

#### Scenario: Resize near a boundary
- **WHEN** the browser resizes near a world boundary
- **THEN** the player SHALL remain on its world cell and the origin SHALL clamp to valid coordinates

#### Scenario: Resize near a visible boundary
- **WHEN** the browser resizes at any displayed zoom
- **THEN** the player SHALL remain on its world cell, the selected camera mode SHALL recalculate its visible origin or wrap geometry, and the renderer SHALL not render beyond the world boundary
