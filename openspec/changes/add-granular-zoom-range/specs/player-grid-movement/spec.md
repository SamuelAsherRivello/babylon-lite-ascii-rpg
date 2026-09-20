# Spec Delta

## MODIFIED Requirements

### Requirement: Full-screen logical rendering
The game SHALL render through the Babylon Lite game layer into the full browser viewport with no outer margins. The logical viewport dimensions SHALL be the current screen dimensions divided by the configured `upscale` value, which defaults to `1.0`. The game SHALL support the displayed zoom range `1`–`10`, with displayed zoom `1` using 0.1× the current zoom-1 scale, displayed zoom `10` using the current zoom-10 scale, and displayed zooms `2`–`9` evenly distributed multiplicatively between those endpoints.

#### Scenario: Farthest zoom
- **WHEN** the browser viewport is `1280 x 720`, `upscale` is `1.0`, and displayed zoom is `1`
- **THEN** the visible grid SHALL expand by the remapped effective scale and rendering SHALL remain bounded by the world dimensions

#### Scenario: Closest zoom
- **WHEN** the browser viewport is `1280 x 720`, `upscale` is `1.0`, and displayed zoom is `10`
- **THEN** the visible grid SHALL match the current zoom-10 effective view

#### Scenario: Browser resize
- **WHEN** the browser viewport changes size
- **THEN** the screen dimensions, logical dimensions, and rendered grid SHALL update to fill the new viewport without adding margins, while retaining the current displayed zoom, effective scale, and player world position

### Requirement: Screen-sized world boundaries
The world SHALL be independent of the viewport, and the Babylon Lite renderer SHALL show only cells within the current logical viewport. The active camera mode SHALL determine how the visible origin responds to player movement at every remapped displayed zoom, including the larger far-zoom viewport. The outermost row and column of the generated world SHALL remain non-walkable `W` cells, and the renderer SHALL never synthesize or render cells outside the world to fill a viewport.

#### Scenario: Movement at a far-zoom world edge
- **WHEN** displayed zoom `1` makes the visible viewport reach a world edge
- **THEN** the player SHALL remain constrained by valid walkable cells and the renderer SHALL clamp the visible origin without rendering beyond the border

#### Scenario: Resize near a visible boundary
- **WHEN** the browser resizes at any displayed zoom
- **THEN** the player SHALL remain on its world cell, the selected camera mode SHALL recalculate its visible origin or wrap geometry, and the renderer SHALL not render beyond the world boundary
