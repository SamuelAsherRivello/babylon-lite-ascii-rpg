# Spec Delta

## Purpose

Keeps the game HUD and editor windows fully usable when a browser changes
between landscape and portrait mobile-sized viewports.

## ADDED Requirements

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

### Requirement: Responsive editor window geometry
The Ascii Palette and Font editor window SHALL fit within the viewport with a
visible border, header, controls, and close action in both orientations. The
window body MAY scroll for palette content, but its frame SHALL not cause page
or horizontal overflow.

#### Scenario: Open editor in portrait
- **WHEN** a developer opens the Ascii Palette in a portrait viewport
- **THEN** the editor frame, tabs, and close action are visible within the
  viewport and palette content is reachable through its window body

#### Scenario: Switch to Font in portrait
- **WHEN** a developer selects the Font tab in a portrait viewport
- **THEN** the font selector, preview, and Confirm, Reset, and Cancel actions
  are visible inside the editor frame
