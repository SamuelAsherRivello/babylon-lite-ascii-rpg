# ascii-palette Specification

## Purpose
Provides a complete, editable glyph-style palette for the ASCII RPG so every
visible Code Page 437 character can be used and styled consistently at runtime.

## Requirements

### Requirement: Complete visible glyph inventory

The palette SHALL contain one entry for every visible Code Page 437 value from
32 through 254, one entry for the Unicode bullet `•` (U+2022), and the following
64 text-style Unicode symbols:

- Arrows: `↑ ↓ ← → ↖ ↗ ↘ ↙ ↔ ↕ ⇧ ⇩ ↩ ↪`
- Suits and hearts: `♥ ♡ ♦ ♢ ♣ ♧ ♠ ♤`
- Map shapes and markers: `◇ ◆ ▲ ▼ △ ▽ ○ ● ◉ ◎ ⊙ ⌖ ⌑ ☆ ★ ✦ ✧ ✶`
- Nature and music: `♪ ♫ ☼ ☀ ☾ ☽ ☁ ☂ ☃ ❄ ♨`
- Gameplay symbols: `⚔ ⚒ ⚙ ⚑ ⚐ ⚠ ☠ ☘ ⚖ ⚗ ⚕ ✝ ☯`

Every entry SHALL expose its numeric or Unicode identity and its rendered glyph
value. The game SHALL be permitted to use any entry without an allow-list.

#### Scenario: Code Page 437 inventory

- **WHEN** the palette is loaded
- **THEN** every value from 32 through 254 SHALL be present exactly once

#### Scenario: Bullet inventory

- **WHEN** the palette is loaded
- **THEN** the bullet entry U+2022 SHALL be present even though it is not a
  standard ASCII or Code Page 437 value

#### Scenario: Text symbol inventory

- **WHEN** the palette is loaded
- **THEN** all 64 text-style symbols SHALL be present exactly once with
  Unicode identities and default white styling unless customized

#### Scenario: Existing palette migration

- **WHEN** a version 1 palette containing the previous 224 entries is loaded
- **THEN** its existing styles SHALL be preserved and the 64 new entries SHALL
  be added with default styling

### Requirement: Default glyph styling

Every palette entry SHALL have an editable base color and a runtime-owned
opacity value. New or uncustomized entries SHALL default to white
(`#ffffff`). The Ascii Palette editor SHALL not allow a developer to change
alpha or brightness; those values SHALL be derived by the active rendering
lighting system. A palette entry SHALL be considered customized only when its
base color differs from the default.

#### Scenario: Default entry

- **WHEN** a palette entry has not been customized
- **THEN** the entry SHALL report base color `#ffffff` and default status,
  while rendered opacity is supplied by the runtime

#### Scenario: Customized color entry

- **WHEN** a developer changes a glyph's base color and confirms it
- **THEN** the entry SHALL report the confirmed color and customized status,
  while runtime lighting continues to control rendered opacity and brightness

#### Scenario: Customized entry

- **WHEN** a developer changes an entry's base color and confirms it
- **THEN** the entry SHALL report the confirmed color and customized status

#### Scenario: Restore default color

- **WHEN** a developer changes an entry back to white (`#ffffff`)
- **THEN** the entry SHALL again report default status

#### Scenario: Restore defaults

- **WHEN** a developer changes an entry back to white (`#ffffff`)
- **THEN** the entry SHALL again report default status

### Requirement: Palette table editor

The palette editor SHALL retain its color picker but SHALL not render an alpha
slider, alpha input, brightness control, or equivalent user control for glyph
opacity or brightness.

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

#### Scenario: Edit base color only

- **WHEN** a developer opens a glyph editor
- **THEN** the editor SHALL show the glyph and base-color control without an
  opacity or brightness control

#### Scenario: Edit glyph appearance

- **WHEN** a developer changes the color with the color picker
- **THEN** the preview SHALL update without changing the saved palette yet

#### Scenario: Cancel glyph edit

- **WHEN** a developer clicks Cancel
- **THEN** the editor SHALL close and the selected palette entry SHALL retain its
  previous saved values

#### Scenario: Confirm base color edit

- **WHEN** a developer confirms a valid base-color edit
- **THEN** the saved base color SHALL update and the current game SHALL apply
  its active runtime lighting to the glyph

#### Scenario: Confirm glyph edit

- **WHEN** a developer clicks Confirm with a valid base color
- **THEN** the editor SHALL close, the table SHALL refresh, and the current game
  SHALL use the confirmed base color with runtime lighting

### Requirement: Local development persistence

When running under the local Vite development server, confirming a palette edit
SHALL persist the complete palette to the shared static JSON file. If the file
write fails, the edit SHALL be rejected and the previously saved value SHALL
remain visible.

#### Scenario: Successful local save

- **WHEN** a developer confirms an edit in local Vite development and the file
  write succeeds
- **THEN** the static palette file SHALL contain the new value and the current
  game SHALL render it

#### Scenario: Failed local save

- **WHEN** a developer confirms an edit in local Vite development and the file
  write fails
- **THEN** the edit SHALL be rejected, the previous value SHALL remain active,
  and the user SHALL receive an error indication

### Requirement: Deployed browser persistence warning

When the application is deployed without disk-write access, confirming a
palette edit SHALL persist it to browser `localStorage`. After the first
confirmed edit that has not been acknowledged, the application SHALL show a
warning that the change is local to the current browser and does not update the
published game. The warning SHALL include an unchecked `Hide warning` checkbox.

#### Scenario: Deployed save

- **WHEN** a developer confirms a palette edit in a deployed build
- **THEN** the edit SHALL update the current game and persist in that browser's
  `localStorage`

#### Scenario: Deployed warning

- **WHEN** the first unacknowledged deployed edit is confirmed
- **THEN** the warning SHALL appear with `Hide warning` unchecked by default

#### Scenario: Hide deployed warning

- **WHEN** a developer checks `Hide warning` and acknowledges the warning
- **THEN** later confirmed edits SHALL not show that warning again in the same
  browser storage scope

### Requirement: Cross-instance palette updates

After a palette edit is successfully confirmed, same-origin game instances
SHALL be notified of the change. Local development instances SHALL reload the
disk-backed palette, and deployed instances SHALL reload the updated browser
storage value. An instance that cannot receive the notification SHALL continue
to render its last valid palette and remain usable.

#### Scenario: Local development synchronization

- **WHEN** one local Vite game instance confirms a palette edit successfully
- **THEN** another open local instance SHALL receive a change notification and
  reload the shared palette file

#### Scenario: Deployed synchronization

- **WHEN** one deployed game instance confirms a palette edit
- **THEN** another open same-origin instance SHALL receive a change notification
  and apply the updated browser-stored palette

#### Scenario: Synchronization fallback

- **WHEN** an instance cannot receive a palette change notification
- **THEN** that instance SHALL keep its last valid palette and SHALL not become
  unusable

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
