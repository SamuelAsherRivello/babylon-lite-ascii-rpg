# Spec Delta

## MODIFIED Requirements

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
