# Spec Delta

## MODIFIED Requirements

### Requirement: Responsive four-corner HUD
The game SHALL retain its HUD regions within one shared inset from the viewport edges. The upper-left and upper-right regions SHALL be equal-sized bordered boxes aligned across the top of the viewport, with the upper-left box serving as the Character box and the upper-right box serving as the Minimap box. The lower-left and lower-right regions SHALL retain their existing responsive behavior and remain usable without clipping or overflow.

#### Scenario: Matching top boxes in landscape
- **WHEN** the game is shown in a landscape viewport
- **THEN** the Character box and Minimap box appear at the upper-left and upper-right with the same width, height, border, and shared inset

#### Scenario: Constrained landscape HUD
- **WHEN** the browser is resized to a short landscape viewport
- **THEN** all four corner regions and every Windows and Settings control are visible inside the shared margins without vertical overflow

#### Scenario: Matching top boxes in portrait
- **WHEN** the game is shown in a portrait or mobile-sized viewport
- **THEN** both top boxes remain visible within the viewport, retain matching geometry and borders, and do not cause page overflow

#### Scenario: Portrait HUD
- **WHEN** the browser is resized to a portrait viewport
- **THEN** every corner region remains inside its shared margins and the game canvas continues to fill the viewport behind the UI

#### Scenario: Character box contents are deferred
- **WHEN** this layout change is implemented before the character-panel design is specified
- **THEN** the upper-left box is established as the Character box without requiring unspecified character data or controls
