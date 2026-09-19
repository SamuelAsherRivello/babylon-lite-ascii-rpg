# Spec Delta

## MODIFIED Requirements

### Requirement: Palette table editor

The Ascii Palette window SHALL provide two title tabs: `Ascii Palette` and
`/ Font`. The `Ascii Palette` tab SHALL be selected initially and SHALL retain
the compact multi-column layout containing only each index and styled glyph.
Selecting `/ Font` SHALL visibly select that tab and replace the body with the
font editor without closing the window or changing the glyph palette state.

#### Scenario: Open palette with palette tab selected
- **WHEN** a developer opens the Ascii Palette window
- **THEN** the `Ascii Palette` tab SHALL have the selected treatment and the
  existing glyph table SHALL be visible

#### Scenario: Switch to font tab
- **WHEN** a developer clicks `/ Font`
- **THEN** `/ Font` SHALL have the selected treatment and the glyph table SHALL
  be replaced by the font editor body

#### Scenario: Return to palette tab
- **WHEN** a developer clicks `Ascii Palette` after opening the font tab
- **THEN** the glyph table SHALL return with its current filter, sort, and
  uncommitted glyph-edit state preserved or safely cancelled according to the
  existing window lifecycle

#### Scenario: Open glyph editor
- **WHEN** a developer selects a glyph row
- **THEN** an anchored editor SHALL open near that entry and show the selected
  glyph in a preview

#### Scenario: Edit glyph appearance
- **WHEN** a developer changes the color with the color picker or changes alpha
  with the slider
- **THEN** the preview SHALL update without changing the saved palette yet

#### Scenario: Cancel glyph edit
- **WHEN** a developer clicks Cancel
- **THEN** the editor SHALL close and the selected palette entry SHALL retain its
  previous saved values

#### Scenario: Confirm glyph edit
- **WHEN** a developer clicks Confirm with valid color and alpha values
- **THEN** the editor SHALL close, the table SHALL refresh, and the current game
  SHALL use the confirmed style

## ADDED Requirements

### Requirement: Font selection editor

The `/ Font` tab SHALL show a dropdown with exactly five configured choices:
Monospace, Consolas, Courier New, Lucida Console, and System Monospace. The
current font SHALL be selected when the tab opens. A developer SHALL be able to
stage a different choice, immediately preview it in the ASCII rendering and
all open same-origin game instances, Confirm it, or Cancel it. Reset SHALL
preview the configured default font without closing the window or committing
until Confirm is clicked.

#### Scenario: Show configured font choices
- **WHEN** a developer opens the `/ Font` tab
- **THEN** the dropdown SHALL contain the five configured font choices and
  SHALL identify the current choice

#### Scenario: Cancel font edit
- **WHEN** a developer selects another font and clicks Cancel
- **THEN** the saved font SHALL remain unchanged, the staged choice SHALL be
  discarded, and all open same-origin game instances SHALL return to the saved
  font

#### Scenario: Confirm font edit
- **WHEN** a developer selects another font and clicks Confirm
- **THEN** the font SHALL be saved, the current game's glyph rendering SHALL
  update immediately, and the Font editor window SHALL close

#### Scenario: Reset font draft
- **WHEN** a developer clicks Reset in the font editor
- **THEN** the dropdown SHALL show the configured default font while the saved
  font and current game remain unchanged until Confirm

### Requirement: Local development font persistence

When running under the local Vite development server, confirming a font edit
SHALL persist the selected font to the shared static configuration file. If the
file write fails, the edit SHALL be rejected and the previously saved font
SHALL remain active and visible.

#### Scenario: Successful local font save
- **WHEN** a developer confirms a font edit in local Vite development and the
  file write succeeds
- **THEN** the static configuration SHALL contain the selected font and the
  current game SHALL render subsequent glyphs with it

#### Scenario: Failed local font save
- **WHEN** a developer confirms a font edit in local Vite development and the
  file write fails
- **THEN** the selected font SHALL not become active and the user SHALL receive
  an error indication

### Requirement: Deployed browser font persistence warning

When the application is deployed without disk-write access, confirming a font
edit SHALL persist it to browser storage. The first unacknowledged deployed
font edit SHALL use the existing local-only warning with an unchecked `Hide
warning` checkbox, explaining that the change will not update the published
game.

#### Scenario: Deployed font save
- **WHEN** a developer confirms a font edit in a deployed build
- **THEN** the edit SHALL update the current game and persist for that browser
  session scope according to the existing palette persistence behavior

#### Scenario: Deployed font warning
- **WHEN** the first unacknowledged deployed font edit is confirmed
- **THEN** the local-only warning SHALL appear with `Hide warning` unchecked by
  default

### Requirement: Cross-instance font updates

After a font draft changes or is successfully confirmed, same-origin game
instances SHALL be notified. Draft notifications SHALL update rendering only;
confirmed notifications SHALL reload the disk-backed or browser-stored font as
appropriate. Instances unable to receive or apply the notification SHALL retain
their last valid font and remain usable.

#### Scenario: Local development font synchronization
- **WHEN** one local Vite instance previews or confirms a font edit
- **THEN** another open local instance SHALL receive the preview immediately,
  and confirmed state SHALL reload from the shared static configuration

#### Scenario: Deployed font synchronization
- **WHEN** one deployed instance previews or confirms a font edit
- **THEN** another open same-origin instance SHALL receive the preview
  immediately, and confirmed state SHALL apply from browser storage

#### Scenario: Font synchronization fallback
- **WHEN** an instance cannot receive or apply a font change notification
- **THEN** it SHALL keep its last valid font and SHALL not become unusable
