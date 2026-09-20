# zoom-levels Specification

## Purpose

Provides a bounded user-controlled zoom for the ASCII RPG while keeping one
stable oversized level, a permanent non-walkable world border, and a viewport
that does not follow the player during movement.

## Requirements

### Requirement: Lock is the default camera mode

When no valid camera mode is saved, the game SHALL select `Camera Lock`.
Saved valid camera modes SHALL continue to take precedence over this default.

#### Scenario: New game defaults to camera lock

- **WHEN** a game view is shown with no saved camera mode
- **THEN** the Settings UI SHALL display `CameraMode (Lock)`

### Requirement: Bounded zoom control

The Settings UI SHALL expose a `Zoom + N -` control whose value starts at `5`
on PC and Mobile when no saved zoom value exists, and SHALL remain
between `1` and `10`, inclusive. A saved valid zoom value SHALL take precedence
over the platform default. Increasing the value SHALL make glyph cells larger
and decreasing the value SHALL make glyph cells smaller.

#### Scenario: Default zoom value

- **WHEN** a new PC game view is shown with no saved zoom value
- **THEN** the Settings UI SHALL display `Zoom + 5 -`

#### Scenario: Default Mobile zoom value

- **WHEN** a new Mobile game view is shown with no saved zoom value
- **THEN** the Settings UI SHALL display `Zoom + 5 -`

#### Scenario: Saved zoom value

- **WHEN** a game view is shown with a saved valid zoom value
- **THEN** the Settings UI SHALL display the saved value regardless of platform

#### Scenario: Zoom in

- **WHEN** the user activates the plus control while the value is below `10`
- **THEN** the value SHALL increase by one and the visible glyph cells SHALL
  become larger

#### Scenario: Zoom out

- **WHEN** the user activates the minus control while the value is above `1`
- **THEN** the value SHALL decrease by one and the visible glyph cells SHALL
  become smaller

#### Scenario: Zoom bounds

- **WHEN** the user activates plus at `10` or minus at `1`
- **THEN** the value SHALL remain unchanged and SHALL NOT leave the range
  `1` through `10`

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
