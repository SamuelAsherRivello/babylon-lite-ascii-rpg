# ascii-palette Specification

## Purpose
Provides a complete, editable glyph-style palette for the ASCII RPG so every
visible Code Page 437 character can be used and styled consistently at runtime.

## Requirements

### Requirement: Complete visible glyph inventory

The palette SHALL contain one entry for every visible Code Page 437 value from
32 through 254 and one additional entry for the Unicode bullet `•` (U+2022).
Every entry SHALL expose its numeric or Unicode identity and its rendered glyph
value. The game SHALL be permitted to use any entry without an allow-list.

#### Scenario: Code Page 437 inventory

- **WHEN** the palette is loaded
- **THEN** every value from 32 through 254 SHALL be present exactly once

#### Scenario: Bullet inventory

- **WHEN** the palette is loaded
- **THEN** the bullet entry U+2022 SHALL be present even though it is not a
  standard ASCII or Code Page 437 value

### Requirement: Default glyph styling

Every palette entry SHALL have a color and alpha value. New or uncustomized
entries SHALL default to white (`#ffffff`) and fully opaque alpha (`1.0`). A
palette entry SHALL be considered customized only when its color or alpha
differs from those defaults.

#### Scenario: Default entry

- **WHEN** a palette entry has not been customized
- **THEN** the entry SHALL report color `#ffffff`, alpha `1.0`, and default
  status

#### Scenario: Customized entry

- **WHEN** a developer changes an entry's color or alpha and confirms it
- **THEN** the entry SHALL report the confirmed values and customized status

#### Scenario: Restore defaults

- **WHEN** a developer changes an entry back to white with alpha `1.0`
- **THEN** the entry SHALL again report default status

### Requirement: Palette table editor

The Ascii Palette window SHALL display every palette entry in a compact
multi-column layout containing only its index and glyph. The glyph SHALL be
styled with its current color and alpha. Selecting a visible glyph SHALL open
an editor positioned near the selected entry.

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
