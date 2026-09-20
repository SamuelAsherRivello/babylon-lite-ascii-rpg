# Spec Delta

## MODIFIED Requirements

### Requirement: Bounded zoom control
The Settings UI SHALL expose exactly ten displayed zoom values, `1` through `10`, inclusive. Displayed zoom `1` SHALL render at 0.1× the current zoom-1 scale. Displayed zoom `10` SHALL render at the current zoom-10 scale. Displayed zooms `2` through `9` SHALL be evenly spaced by nominal effective value between those endpoints, adding `1.1` effective zoom units per step. Increasing the displayed value SHALL make glyph cells larger and decreasing it SHALL make glyph cells smaller. Existing saved values and platform defaults SHALL be migrated to the nearest displayed value with equivalent effective zoom.

#### Scenario: Ten remapped values
- **WHEN** a new game view is shown
- **THEN** the Settings UI SHALL allow exactly displayed values `1` through `10`, with displayed `1` at 0.1× the current zoom-1 scale and displayed `10` at the current zoom-10 scale

#### Scenario: Even nominal spacing
- **WHEN** the displayed value changes between adjacent values from `1` through `10`
- **THEN** each step SHALL add the same `1.1` effective zoom units

#### Scenario: Zoom bounds
- **WHEN** the user activates plus at `10` or minus at `1`
- **THEN** the displayed value SHALL remain unchanged and SHALL NOT leave the range `1` through `10`

#### Scenario: Existing saved zoom migration
- **WHEN** a saved zoom from the current `1`–`10` range is restored
- **THEN** it SHALL be converted to the nearest new displayed value with the same effective view and SHALL not be silently reset to a device default

#### Scenario: Device default migration
- **WHEN** no saved zoom exists on a supported device
- **THEN** the device's current default effective view SHALL be preserved by selecting the nearest new displayed value before the first render

#### Scenario: Minimap state migration
- **WHEN** a saved or default minimap scale is restored
- **THEN** its map-content coverage and apparent scale SHALL remain equivalent to the current experience, while minimap interaction SHALL remain independent from game zoom

#### Scenario: Default zoom value
- **WHEN** a new PC game view is shown with no saved zoom value
- **THEN** the migrated PC default SHALL preserve the current PC effective view

#### Scenario: Default Mobile zoom value
- **WHEN** a new Mobile game view is shown with no saved zoom value
- **THEN** the migrated Mobile default SHALL preserve the current Mobile effective view

#### Scenario: Saved zoom value
- **WHEN** a game view is shown with a saved valid zoom value
- **THEN** the migrated displayed value SHALL preserve its effective view regardless of platform

#### Scenario: Zoom in
- **WHEN** the user activates plus while the displayed value is below `10`
- **THEN** the value SHALL increase by one and visible glyph cells SHALL become larger

#### Scenario: Zoom out
- **WHEN** the user activates minus while the displayed value is above `1`
- **THEN** the value SHALL decrease by one and visible glyph cells SHALL become smaller

### Requirement: Fixed oversized level viewport
The game SHALL generate one level larger than the normal visible viewport and SHALL retain that same world and player cell while the user changes displayed zoom or the browser viewport size. When displayed zoom changes, the visible window SHALL be resolved according to the active camera mode using the effective scale derived from the logarithmic ten-level mapping. No camera mode SHALL render cells beyond the generated world boundary.

#### Scenario: Zoom preserves level state
- **WHEN** the user changes the displayed zoom value
- **THEN** the renderer SHALL change effective cell size without regenerating the level, changing the player's world cell, changing minimap state, or resetting the selected camera mode

#### Scenario: Far zoom at world boundary
- **WHEN** displayed zoom `1` exposes a viewport larger than the remaining world area near an edge
- **THEN** the viewport SHALL clamp to the world, show only valid cells, and SHALL NOT require automatic world expansion

#### Scenario: Camera Center keeps the player visible
- **WHEN** the player is outside the current visible window and displayed zoom changes in Camera Center mode
- **THEN** the viewport SHALL recenter or clamp so the player remains visible

#### Scenario: Player leaves the visible window
- **WHEN** the player moves beyond the current visible window in Camera Lock mode
- **THEN** movement SHALL follow the existing lock-mode edge-wrap rule

#### Scenario: Zoom keeps the player visible
- **WHEN** displayed zoom changes in Camera Center mode
- **THEN** the viewport SHALL recenter or clamp around the player without changing world state

#### Scenario: Camera Deadzone recalculates
- **WHEN** displayed zoom changes in Camera Deadzone mode
- **THEN** visible dimensions and dead-zone thresholds SHALL recalculate without resetting position

#### Scenario: Camera Lock preserves its origin
- **WHEN** displayed zoom changes in Camera Lock mode
- **THEN** the renderer SHALL preserve the existing orientation as far as valid dimensions allow

#### Scenario: Zoom preserves orientation after keeping the player visible
- **WHEN** more than one valid window can keep the player visible in Deadzone mode
- **THEN** the renderer SHALL choose the window that changes prior orientation least

#### Scenario: Viewport never renders beyond the level
- **WHEN** any displayed zoom reaches a world boundary
- **THEN** only valid world cells SHALL render
