# Spec Delta

## MODIFIED Requirements

### Requirement: Fixed oversized level viewport

The game SHALL generate one level larger than the normal visible viewport and
SHALL retain that same world and player cell while the user changes zoom or the
browser viewport size. When zoom changes, the visible window SHALL be resolved
according to the active camera mode: `Camera Center` SHALL center or clamp on
the player, `Camera Deadzone` SHALL preserve the dead-zone relationship, and
`Camera Lock` SHALL preserve the locked origin when valid. Movement SHALL
follow, remain within, or wrap the visible window according to that mode.

#### Scenario: Zoom preserves level state

- **WHEN** the user changes the zoom value
- **THEN** the renderer SHALL change visible cell size without regenerating the
  level, changing the player's world cell, or resetting the selected camera mode

#### Scenario: Camera Center keeps the player visible

- **WHEN** the player is outside the current visible window and the user changes
  zoom while `Camera Center` is active
- **THEN** the viewport SHALL recenter or clamp so the player is visible, unless
  the world is smaller than the viewport in that dimension

#### Scenario: Player leaves the visible window

- **WHEN** the player moves beyond the current visible window but remains in a
  valid walkable world cell while `Camera Lock` is active
- **THEN** movement SHALL follow the lock-mode edge-wrap rule rather than
  requiring the player to remain visible in the unchanged window

#### Scenario: Zoom keeps the player visible

- **WHEN** the player is outside the current visible window and the user changes
  zoom while `Camera Center` is active
- **THEN** the viewport SHALL recenter or clamp so the player is visible, unless
  the world is smaller than the viewport in that dimension

#### Scenario: Camera Deadzone recalculates

- **WHEN** the user changes zoom while `Camera Deadzone` is active
- **THEN** the viewport SHALL recalculate visible dimensions and dead-zone
  thresholds without resetting the world or player position

#### Scenario: Camera Lock preserves its origin

- **WHEN** the user changes zoom while `Camera Lock` is active
- **THEN** the renderer SHALL preserve the existing viewport orientation as far
  as valid dimensions allow and SHALL keep the player/world state unchanged

#### Scenario: Zoom preserves orientation after keeping the player visible

- **WHEN** a zoom change can keep the player visible in more than one valid world
  window while `Camera Deadzone` is active
- **THEN** the renderer SHALL choose the window that changes the previous map
  orientation as little as the dead-zone and visibility constraints allow

#### Scenario: Viewport never renders beyond the level

- **WHEN** the visible window reaches a world boundary at any zoom value or
  camera mode
- **THEN** the renderer SHALL show only valid world cells and SHALL NOT render
  cells beyond the level
