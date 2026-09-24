# responsive-ui-layout Specification

## Purpose
Keeps the game HUD and editor windows fully usable when a browser changes
between landscape and portrait mobile-sized viewports.

## Requirements

### Requirement: Responsive four-corner HUD
The game SHALL retain its HUD regions within one shared inset from the viewport edges. The upper-left and upper-right regions SHALL be equal-sized bordered boxes aligned across the top of the viewport, with the upper-left box serving as the Character box and the upper-right box serving as the Minimap box. The lower-left Dev panel and lower-right Log panel SHALL retain matching open dimensions, remain anchored to their respective lower corners, and keep all visible lower-left tools usable without clipping, scrollbars, or overflow.

#### Scenario: Matching top boxes in landscape
- **WHEN** the game is shown in a landscape viewport
- **THEN** the Character box and Minimap box appear at the upper-left and upper-right with the same width, height, border, and shared inset

#### Scenario: Constrained landscape HUD
- **WHEN** the browser is resized to a short landscape viewport
- **THEN** all four corner regions and every Windows and Settings control are visible inside the shared margins without vertical overflow

#### Scenario: Matching lower panels when open
- **WHEN** both Dev and Log are open
- **THEN** their panels have matching width and height without changing their lower-left and lower-right anchors

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
desktop users can test portrait behavior. In portrait on a non-mobile browser,
the system SHALL show a non-interactive forest-gate presentation entirely
outside that 9:16 frame: backdrop artwork fills the available left and right
gutters and mirrored rails with visible depth treatment border the frame. The
letterbox SHALL remain present in desktop fullscreen and when the HUD is
hidden. In portrait on a mobile platform, the game presentation SHALL fill the
available browser viewport rather than enforcing the desktop test-frame ratio,
and SHALL NOT show the letterbox presentation. Before the first visible game
world render, the presentation frame, camera mode, and zoom SHALL reflect their
saved selections. When a saved selection already matches active game state,
restoring it SHALL NOT submit a corrective world render or change the player's
initial screen position.

#### Scenario: Default landscape presentation
- **WHEN** a user opens the game with no saved aspect selection
- **THEN** the Settings control displays `Aspect (Landscape)` and the
  viewport-filling presentation is wider than tall without forest-gate
  gutters or rails

#### Scenario: Saved landscape starts with one centered presentation
- **WHEN** a user opens the game with saved landscape, camera, and zoom selections
- **THEN** the first visible world render uses the viewport-filling landscape
  frame with the player's initial camera position and zoom already applied, and
  no subsequent settings-driven correction is visible

#### Scenario: Saved desktop portrait starts with its test frame
- **WHEN** a non-mobile user opens the game with saved portrait, camera, and zoom selections
- **THEN** the first visible world render uses the centered 9:16 test frame and
  no subsequent settings-driven correction changes its initial camera position

#### Scenario: Desktop user selects portrait testing
- **WHEN** a non-mobile user activates `Aspect (Landscape)`
- **THEN** the control displays `Aspect (Portrait)` and the game uses a
  centered 9:16 tall test frame, and the available space outside its left and
  right edges shows the forest-gate backdrop and mirrored rails

#### Scenario: Desktop portrait preserves the game frame
- **WHEN** the forest-gate presentation is visible on a non-mobile browser
- **THEN** its rails and gutters do not resize, cover, or intercept input for
  the game frame or HUD

#### Scenario: Narrow desktop portrait crops outer presentation
- **WHEN** a non-mobile Portrait viewport leaves little or no horizontal space
  outside the 9:16 game frame
- **THEN** the game frame retains its 9:16 geometry and any outer backdrop or
  rail artwork may extend beyond the far left and right viewport edges

#### Scenario: Desktop fullscreen portrait presentation
- **WHEN** a non-mobile user enters fullscreen while Portrait mode is selected
- **THEN** the 9:16 game frame, gutters, backdrop, and mirrored rails remain
  visible according to the available viewport width

#### Scenario: Portrait presentation remains when HUD is hidden
- **WHEN** a non-mobile user hides the HUD while Portrait mode is selected
- **THEN** the forest-gate presentation remains visible outside the game frame

#### Scenario: Mobile user selects portrait
- **WHEN** a mobile-platform user activates the aspect control while portrait
  is selected
- **THEN** the game fills that browser viewport without a forced 9:16 frame
  or forest-gate gutters and rails

#### Scenario: Aspect selection persists and resets
- **WHEN** a user refreshes after changing the aspect setting
- **THEN** the selected aspect is restored before the first visible game world render

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

### Requirement: Character HUD presents stamina below health

The Character box SHALL display bars in this order: Health, Stamina, Offense,
Defense, and Experience. Every bar SHALL derive a solid current shade, a
lighter temporary delta shade, and a dark unfilled shade from that bar's
configured target color. Bars SHALL render normalized `0`-to-`100` percentages
supplied by the owning resource model and SHALL NOT infer those percentages
from nominal values. Stamina SHALL appear directly below Health and reflect the
authoritative gameplay snapshot without numeric text.

#### Scenario: Full stamina presentation

- **WHEN** a new game starts with `50` current stamina out of `50` maximum
- **THEN** the Stamina bar SHALL be visible directly below Health and display
  `50` units of solid orange current fill followed by `50` units of dark orange
  unfilled capacity

#### Scenario: Stamina transition presentation

- **WHEN** movement or a T tick changes stamina
- **THEN** the interval between the previous and next visual values SHALL
  temporarily use the delta shade before settling into the current or unfilled
  shade, while accessibility continues to expose gameplay current/max

#### Scenario: Every bar derives three shades from its target color

- **WHEN** any Character bar renders or changes value
- **THEN** its current, temporary delta, and unfilled sections SHALL be derived
  from that bar's configured target color rather than shared fixed colors

#### Scenario: Different nominal scales share the percentage bar

- **WHEN** two resources use different nominal values for their full or partial
  states
- **THEN** each owning resource model SHALL supply normalized percentages and
  the generic bar SHALL render those percentages without interpreting the
  nominal values

#### Scenario: HUD remains usable in portrait

- **WHEN** the game is shown in a supported portrait or mobile-sized viewport
- **THEN** all five bars SHALL remain visible without clipping or overflow

### Requirement: Character resource slots make room for the fifth bar

The Character resource and slot boxes SHALL use a hardcoded `22.4px` square
size, reduced from the existing `28px` size, so the new Stamina bar has room
without displacing controls outside the Character box.

#### Scenario: Reduced slot geometry

- **WHEN** the Character box renders with the five-bar layout
- **THEN** each resource or slot box SHALL use the `22.4px` square geometry and
  remain aligned within the responsive Character box

### Requirement: Responsive tutorial window geometry

The Tutorial and Tutorial Complete windows SHALL remain fully visible and
operable within the browser viewport on desktop and mobile-sized landscape and
portrait presentations. Their title, instruction or completion content, and
action controls SHALL remain reachable without page or horizontal overflow,
and the game canvas SHALL remain usable behind the non-modal window.

#### Scenario: Tutorial opens in portrait

- **WHEN** a new session starts in a portrait viewport
- **THEN** the Tutorial title, instruction, `Next`, and `Skip Tutorial` actions
  are visible within the viewport and the window does not create horizontal
  overflow

#### Scenario: Tutorial opens in constrained landscape

- **WHEN** a new session starts in a short landscape viewport
- **THEN** the Tutorial title, instruction, `Next`, and `Skip Tutorial` actions
  remain visible inside the shared UI margins

#### Scenario: Completion window remains operable

- **WHEN** the Tutorial Complete window appears in any supported presentation
- **THEN** its title, matching body layout, and `Ok` action remain visible and
  operable without clipping or scrolling the page

### Requirement: Explicit fullscreen activation
The application SHALL request fullscreen only from an explicit fullscreen control, never as a side effect of another menu action.

#### Scenario: Menu click
- **WHEN** a player clicks a menu action other than Fullscreen
- **THEN** no fullscreen request SHALL be made
