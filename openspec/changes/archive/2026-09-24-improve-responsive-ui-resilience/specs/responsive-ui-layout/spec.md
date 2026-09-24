# Spec Delta

## ADDED Requirements

### Requirement: Zoom-resilient React presentation
The React-owned interface SHALL use the available CSS viewport as its layout
space and SHALL NOT infer layout class from monitor resolution, Windows display
scale, or device pixel ratio. The standard Chrome 100% zoom presentation SHALL
be the visual-density reference: the world remains the primary visual area and
the Character, minimap, quest, project/developer controls, world status, and
log retain their established roles. At Chrome zoom values of 80%, 100%, and
125%, the interface SHALL reflow or compact within the available CSS viewport
without horizontal page overflow, clipped required controls, or overlap that
prevents use of another visible control.

#### Scenario: Preferred 100% Chrome baseline
- **WHEN** the game is shown in a desktop landscape CSS viewport at Chrome 100%
  zoom with the HUD enabled
- **THEN** the four-corner presentation retains the established visual hierarchy
  and the world remains unobscured as the focal area

#### Scenario: Reduced Chrome zoom
- **WHEN** the game is shown at Chrome 80% zoom
- **THEN** the HUD does not become an unbounded sparse fixed-pixel composition
  and all required visible controls remain readable and operable

#### Scenario: Increased Chrome zoom
- **WHEN** the game is shown at Chrome 125% zoom
- **THEN** the HUD reflows or compacts within the available CSS viewport without
  horizontal page overflow or clipped required controls

#### Scenario: High-density display
- **WHEN** the game is shown on a display whose browser reports a device pixel
  ratio greater than one
- **THEN** the React layout uses the same CSS-viewport behavior as an equivalent
  device-pixel-ratio-one viewport

### Requirement: React-owned transient surfaces use shared viewport constraints
Every React-owned dialog, editor, tooltip, toast, floating text surface, and
developer control SHALL use the shared responsive inset and sizing rules. A
transient surface SHALL remain visible, readable, dismissible where applicable,
and reachable without forcing document-level horizontal scrolling; an
intentionally scrollable body MAY scroll only within its own surface.

#### Scenario: Open a transient surface in constrained space
- **WHEN** a player opens a React-owned dialog, editor, or developer surface in
  a constrained landscape or portrait CSS viewport
- **THEN** its header and required close or confirm action remain reachable and
  its content either fits or scrolls inside the surface

#### Scenario: Tooltip and toast placement near an edge
- **WHEN** a tooltip or toast is displayed near a viewport edge
- **THEN** it remains within the available presentation bounds and does not hide
  the control that invoked it

## MODIFIED Requirements

### Requirement: Responsive four-corner HUD
The game SHALL retain its HUD regions within one shared responsive inset from
the presentation edges. In the 100%-zoom desktop landscape baseline, the
upper-left Character and upper-right minimap boxes SHALL be matching bordered
panels aligned across the top. The lower-left quest/project/developer region and
lower-right world status/log region SHALL retain their established corner roles,
while the world remains the primary central visual area. At constrained width or
height, each region SHALL use bounded fluid sizing and reflow or compact its
contents before clipping, causing document-level horizontal overflow, or
obscuring another required visible control.

#### Scenario: Matching top boxes in landscape
- **WHEN** the game is shown in a desktop landscape CSS viewport at Chrome 100%
  zoom
- **THEN** the Character box and Minimap box appear at the upper-left and
  upper-right with matching border treatment, aligned geometry, and a shared
  responsive inset

#### Scenario: Constrained landscape HUD
- **WHEN** the browser has a short landscape CSS viewport or increased browser
  zoom reduces its available CSS height
- **THEN** all four corner regions and every visible Windows and Settings
  control remain reachable inside the presentation bounds without vertical
  clipping or document-level horizontal overflow

#### Scenario: Matching top boxes in portrait
- **WHEN** the game is shown in a portrait or mobile-sized CSS viewport
- **THEN** both top boxes remain visible within the presentation bounds, retain
  matching border treatment, and do not cause page overflow

#### Scenario: Portrait HUD
- **WHEN** the browser is resized to a portrait viewport
- **THEN** every required corner region remains inside its responsive inset and
  the game canvas continues to fill the presentation behind the UI

#### Scenario: Character box contents are deferred
- **WHEN** this layout change is implemented before the character-panel design
  is otherwise extended
- **THEN** the upper-left box remains the Character box without requiring new
  character data or controls

### Requirement: Responsive editor window geometry
The Ascii Palette and Font editor window SHALL fit within the shared responsive
presentation inset with a visible border, header, controls, and close action in
both orientations and at supported browser zoom. The window body MAY scroll for
palette content, but its frame SHALL not cause page or horizontal overflow. The
draggable Lighting window SHALL remain fully reachable inside the presentation
bounds at desktop and mobile sizes, including after a title-bar drag; its title
bar, controls, and close action SHALL remain visible and operable. Other
React-owned modal and settings windows SHALL use the same bounded sizing and
internal-scroll behavior.

#### Scenario: Open editor in portrait
- **WHEN** a developer opens the Ascii Palette in a portrait viewport
- **THEN** the editor frame, tabs, and close action are visible within the
  presentation bounds and palette content is reachable through its window body

#### Scenario: Switch to Font in portrait
- **WHEN** a developer selects the Font tab in a portrait viewport
- **THEN** the font selector, preview, and Confirm, Reset, and Cancel actions
  are visible inside the editor frame

#### Scenario: Lighting window is moved near a viewport edge
- **WHEN** a player drags the Lighting window toward a desktop or mobile
  viewport edge
- **THEN** the window remains positioned so its title bar, controls, and close
  action are reachable without page or horizontal overflow

#### Scenario: Editor at increased browser zoom
- **WHEN** a developer opens an editor or settings window at Chrome 125% zoom
- **THEN** its required actions remain reachable and excess content scrolls
  within the window rather than outside the presentation

### Requirement: Character resource slots make room for the fifth bar
The Character resource and slot boxes SHALL form a two-row, three-column grid
whose cells remain square, contained within the Character panel, and onscreen.
Their size SHALL derive from available Character-panel space with bounded
fluid geometry, while preserving the five Character bars and their ordering.
The 100%-zoom desktop baseline SHALL retain the current compact Character-panel
information density rather than adopting oversized cells.

#### Scenario: Responsive slot geometry
- **WHEN** the Character box renders in a supported viewport at 80%, 100%, or
  125% Chrome zoom
- **THEN** every resource or slot box remains square, aligned within the
  responsive Character box, and visible without overlap

#### Scenario: Reduced slot geometry
- **WHEN** the Character box renders with the five-bar layout
- **THEN** each resource or slot box uses bounded responsive square geometry
  and remains aligned within the responsive Character box

#### Scenario: Five-bar and slot coexistence
- **WHEN** the Character panel shows Health, Stamina, Offense, Defense, and
  Experience
- **THEN** all five bars and both rows of resource or slot boxes remain visible
  without displacing controls outside the Character panel
