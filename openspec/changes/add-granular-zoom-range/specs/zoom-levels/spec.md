# Spec Delta

## MODIFIED Requirements

### Requirement: Bounded zoom control
The Settings UI SHALL expose exactly ten displayed zoom values, `1` through `10`, inclusive. Displayed zoom `1` SHALL render at 0.1× the current zoom-1 scale. Displayed zoom `10` SHALL render at the current zoom-10 scale. Displayed zooms `2` through `9` SHALL be evenly spaced in logarithmic scale between those endpoints. Increasing the displayed value SHALL make glyph cells larger and decreasing it SHALL make glyph cells smaller. Existing saved values and platform defaults SHALL be migrated to the nearest displayed value with equivalent effective zoom.

#### Scenario: Ten remapped values
- **WHEN** a new game view is shown
- **THEN** the Settings UI SHALL allow exactly displayed values `1` through `10`, with displayed `1` at 0.1× the current zoom-1 scale and displayed `10` at the current zoom-10 scale

#### Scenario: Even intermediate spacing
- **WHEN** the displayed value changes between adjacent values from `1` through `10`
- **THEN** each step SHALL apply the same multiplicative ratio in effective scale

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

### Requirement: Fixed oversized level viewport
The game SHALL generate one level larger than the normal visible viewport and SHALL retain that same world and player cell while the user changes displayed zoom or the browser viewport size. When displayed zoom changes, the visible window SHALL be resolved according to the active camera mode using the effective scale derived from the logarithmic ten-level mapping. No camera mode SHALL render cells beyond the generated world boundary.

#### Scenario: Zoom preserves level state
- **WHEN** the user changes the displayed zoom value
- **THEN** the renderer SHALL change effective cell size without regenerating the level, changing the player's world cell, changing minimap state, or resetting the selected camera mode

#### Scenario: Far zoom at world boundary
- **WHEN** displayed zoom `1` exposes a viewport larger than the remaining world area near an edge
- **THEN** the viewport SHALL clamp to the world, show only valid cells, and SHALL NOT require automatic world expansion
