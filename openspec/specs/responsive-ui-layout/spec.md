# responsive-ui-layout Specification

## Purpose
Keeps the game HUD and editor windows fully usable when a browser changes
between landscape and portrait mobile-sized viewports.

## Requirements

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

### Requirement: Selectable test presentation aspect
The Settings region SHALL provide a persisted aspect control. A first-time
session SHALL select landscape and display the exact label `Aspect (Landscape)`.
Activating that control SHALL select portrait; while portrait is selected, the
control SHALL display `Aspect (Portrait)` and SHALL toggle back to landscape
when activated. Reset Settings SHALL restore landscape. In landscape, the game
presentation SHALL fill the available browser viewport and its effective
content frame SHALL be wider than tall. In portrait on a desktop-class
platform, the game presentation SHALL use a centered, tall 9:16 test frame so
desktop users can test portrait behavior. In portrait on a mobile platform,
the game presentation SHALL fill the available browser viewport rather than
enforcing the desktop test-frame ratio.

#### Scenario: Default landscape presentation
- **WHEN** a user opens the game with no saved aspect selection
- **THEN** the Settings control displays `Aspect (Landscape)` and the
  viewport-filling presentation is wider than tall

#### Scenario: Desktop user selects portrait testing
- **WHEN** a desktop-class user activates `Aspect (Landscape)`
- **THEN** the control displays `Aspect (Portrait)` and the game uses a
  centered 9:16 tall test frame

#### Scenario: Mobile user selects portrait
- **WHEN** a mobile-platform user activates the aspect control while portrait
  is selected
- **THEN** the game fills that browser viewport without a forced 9:16 frame

#### Scenario: Aspect selection persists and resets
- **WHEN** a user refreshes after changing the aspect setting
- **THEN** the selected aspect is restored

#### Scenario: Reset restores landscape
- **WHEN** a user activates Reset Settings after selecting portrait
- **THEN** the next initialized session selects landscape and displays
  `Aspect (Landscape)`

### Requirement: Responsive editor window geometry
The Ascii Palette and Font editor window SHALL fit within the viewport with a
visible border, header, controls, and close action in both orientations. The
window body MAY scroll for palette content, but its frame SHALL not cause page
or horizontal overflow. The draggable Lighting window SHALL remain fully
reachable inside the viewport at desktop and mobile sizes, including after a
title-bar drag; its title bar, controls, and close action SHALL remain visible
and operable.

#### Scenario: Open editor in portrait
- **WHEN** a developer opens the Ascii Palette in a portrait viewport
- **THEN** the editor frame, tabs, and close action are visible within the
viewport and palette content is reachable through its window body

#### Scenario: Switch to Font in portrait
- **WHEN** a developer selects the Font tab in a portrait viewport
- **THEN** the font selector, preview, and Confirm, Reset, and Cancel actions
are visible inside the editor frame

#### Scenario: Lighting window is moved near a viewport edge
- **WHEN** a player drags the Lighting window toward a desktop or mobile
viewport edge
- **THEN** the window remains positioned so its title bar, controls, and
close action are reachable without page or horizontal overflow

### Requirement: Windows launchers and surfaces remain hit-testable

The three lower-left Windows launchers and every visible control in their resulting windows SHALL receive pointer input above the game canvas and transition surfaces in landscape and portrait presentation modes.

#### Scenario: Activate each Windows launcher
- **WHEN** a player clicks Ascii Settings, Arguments, or Lighting
- **THEN** the corresponding window SHALL open promptly and the browser SHALL remain usable

#### Scenario: Close each Windows surface
- **WHEN** a player uses the corresponding close control, or the modal backdrop where applicable
- **THEN** only the selected window SHALL close and the three launchers SHALL remain usable

### Requirement: Upper-right minimap and lower-left project link placement

The upper-right HUD area SHALL always contain the minimap. The
project GitHub link SHALL appear immediately above the Windows list in the
lower-left HUD region. These placements SHALL remain inside the shared HUD
inset in supported desktop landscape and mobile portrait layouts.

#### Scenario: Minimap occupies the upper right

- **WHEN** the HUD is visible
- **THEN** it is displayed in the upper-right area and the GitHub link is not
  displayed there

#### Scenario: Project link precedes Windows

- **WHEN** the HUD is visible
- **THEN** the GitHub link appears immediately above the Windows list in the
  lower-left region
