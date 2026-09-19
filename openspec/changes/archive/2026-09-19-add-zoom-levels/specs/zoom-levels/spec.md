# Spec Delta

## Purpose

Provides a bounded user-controlled zoom for the ASCII RPG while keeping one
stable oversized level, a permanent non-walkable world border, and a viewport
that does not follow the player during movement.

## ADDED Requirements

### Requirement: Bounded zoom control

The Settings UI SHALL expose a `Zoom + N -` control whose value starts at `5`
and SHALL remain between `1` and `10`, inclusive. Increasing the value SHALL
make glyph cells larger and decreasing the value SHALL make glyph cells smaller.

#### Scenario: Default zoom value

- **WHEN** a new game view is shown
- **THEN** the Settings UI SHALL display `Zoom + 5 -`

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
SHALL retain that same world and player cell while the user changes zoom or
the browser viewport size. When zoom changes, the visible window SHALL first
keep the player on screen, then clamp itself to the world boundary, and then
preserve as much of the previous map orientation as those constraints allow.
Movement SHALL NOT cause the visible window to follow the player.

#### Scenario: Zoom preserves level state

- **WHEN** the user changes the zoom value
- **THEN** the renderer SHALL change visible cell size without regenerating the
  level or resetting the player's world position

#### Scenario: Player leaves the visible window

- **WHEN** the player moves beyond the current visible window but remains in a
  valid walkable world cell
- **THEN** movement SHALL succeed and the player SHALL no longer be required to
  remain visible on screen

#### Scenario: Zoom keeps the player visible

- **WHEN** the player is outside the current visible window and the user
  changes zoom
- **THEN** the viewport SHALL recenter or clamp so the player is visible,
  unless the world is smaller than the viewport in that dimension

#### Scenario: Zoom preserves orientation after keeping the player visible

- **WHEN** a zoom change can keep the player visible in more than one valid
  world window
- **THEN** the renderer SHALL choose the window that changes the previous map
  orientation as little as possible

#### Scenario: Viewport never renders beyond the level

- **WHEN** the visible window reaches a world boundary at any zoom value
- **THEN** the renderer SHALL show only valid world cells and SHALL NOT render
  cells beyond the level
