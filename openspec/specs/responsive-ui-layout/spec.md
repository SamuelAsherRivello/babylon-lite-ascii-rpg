# responsive-ui-layout Specification

## Purpose
Keeps the game HUD and editor windows fully usable when a browser changes
between landscape and portrait mobile-sized viewports.

## Requirements

### Requirement: Responsive four-corner HUD
The game SHALL retain the project title, project links, version, Windows, and
Settings regions within one shared inset from their respective viewport edges.
When a landscape viewport has limited height, the lower-left Windows and
Settings region SHALL compact without scrolling, clipping, or extending beyond
the shared inset; every control SHALL remain visible and operable.

#### Scenario: Constrained landscape HUD
- **WHEN** the browser is resized to a short landscape viewport
- **THEN** all four corner regions and every Windows and Settings control are
  visible inside the shared margins without vertical overflow

#### Scenario: Portrait HUD
- **WHEN** the browser is resized to a portrait viewport
- **THEN** every corner region remains inside its shared margins and the game
  canvas continues to fill the viewport behind the UI

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
