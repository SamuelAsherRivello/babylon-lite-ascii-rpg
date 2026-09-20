# draggable-lighting-window Specification

## Purpose

Provides a compact movable Lighting window so players can adjust illumination
controls without permanently expanding the lower-left Settings corner.

## Requirements

### Requirement: Lighting launcher and movable control window
The lower-left HUD SHALL name its existing window section `Windows - 1` and
SHALL provide a `Windows - 2` section directly below it. `Windows - 2` SHALL
expose only one `Lighting` launcher and SHALL not expose individual lighting
controls. Activating the launcher SHALL show a small non-modal Lighting window
while gameplay and other UI remain available. The window title SHALL use the
shared lower-left corner title text treatment, and its controls SHALL use the
shared lower-left corner body text treatment. The window SHALL contain the
existing GPU Light Pass, Torch Lighting, Torch Shadow, Player Lighting, Player
GPU Shadow Bleed Range, Player Shadow, and Light Ambient controls with their
current values, actions, and value limits. Its visible control labels SHALL be
`Ambient`, `GPU Light Pass`, `Player`, `Player GPU Shadow Bleed Range`,
`Player Shadow`, `Torch`, and `Torch Shadow`, in alphabetical order.

#### Scenario: Open Lighting from Settings
- **WHEN** a player activates `Lighting` in `Windows - 2`
- **THEN** a small Lighting window appears and the individual lighting
  controls are available only inside that window

#### Scenario: Inspect lower-left window launchers
- **WHEN** the player views the lower-left HUD
- **THEN** `Windows - 1` appears above `Windows - 2`, and `Windows - 2`
  contains only `Lighting`

#### Scenario: Keep Lighting open during play
- **WHEN** the Lighting window is open
- **THEN** the player can continue using the game and adjust any lighting
  control without the window closing after an adjustment

### Requirement: Title-bar dragging and voluntary close
The Lighting window SHALL be draggable by its title bar. It SHALL expose a
close action, and closing it SHALL hide only the window until the player opens
it again. Dragging or closing the window SHALL not alter any lighting value.

#### Scenario: Move the Lighting window
- **WHEN** a player drags the Lighting window title bar
- **THEN** the window moves with the pointer and its controls remain usable

#### Scenario: Close and reopen Lighting
- **WHEN** a player closes the Lighting window and later activates `Lighting`
- **THEN** the window is hidden after close and appears again with the current
  lighting values when reopened

### Requirement: Existing lighting behavior remains intact
Moving the lighting control surface into the Lighting window SHALL preserve
each control's local-storage persistence, reset behavior, accessible name and
description, and game-layer update behavior.

#### Scenario: Change a lighting value from the window
- **WHEN** a player changes any Lighting window control
- **THEN** the displayed value, saved preference, and rendered lighting update
  as they did before the window was introduced

### Requirement: Lighting window remains responsive

The Lighting launcher SHALL open the existing non-modal Lighting window without freezing the browser. Its controls, title-bar drag, close action, and reopen behavior SHALL remain usable and SHALL not reset or corrupt lighting values.

#### Scenario: Open, use, close, and reopen Lighting
- **WHEN** a player activates Lighting, changes a lighting control, closes the window, and activates Lighting again
- **THEN** the window SHALL complete each action, close only when requested, and reopen with the current saved values

#### Scenario: Keep the game usable with Lighting open
- **WHEN** the Lighting window is open
- **THEN** game input, HUD controls, and every Lighting control SHALL remain responsive
