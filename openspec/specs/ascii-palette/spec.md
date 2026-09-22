# ascii-palette Specification

## Purpose
Provides a complete, editable glyph-style palette for the ASCII RPG so every
visible Code Page 437 character can be used and styled consistently at client.

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

Every palette entry SHALL have an editable base color and a client-owned
opacity value. New or uncustomized entries SHALL default to white
(`#ffffff`). The Ascii Palette editor SHALL not allow a developer to change
alpha or brightness; those values SHALL be derived by the active rendering
lighting system. A palette entry SHALL be considered customized only when its
base color differs from the default.

#### Scenario: Default entry

- **WHEN** a palette entry has not been customized
- **THEN** the entry SHALL report base color `#ffffff` and default status,
  while rendered opacity is supplied by the client

#### Scenario: Customized color entry

- **WHEN** a developer changes a glyph's base color and confirms it
- **THEN** the entry SHALL report the confirmed color and customized status,
  while client lighting continues to control rendered opacity and brightness

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
  its active client lighting to the glyph

#### Scenario: Confirm glyph edit

- **WHEN** a developer clicks Confirm with a valid base color
- **THEN** the editor SHALL close, the table SHALL refresh, and the current game
  SHALL use the confirmed base color with client lighting

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

### Requirement: Semantic palette Group view

When the developer selects Group sorting in the Ascii Palette, the palette
SHALL organize the existing inventory into named semantic groups rather than
one catch-all punctuation group. The groups SHALL include Letters, Digits,
Punctuation, Single-line Borders, Double-line Borders, Mixed-line Borders,
Blocks and Shading, Terrain, Greek Letters, Mathematical Symbols, Arrows,
Playing Cards, Maps, Status, Weather, Music, Gameplay, Runes, Dice, and Chess.

Box-drawing characters SHALL be classified by their line construction, and
terrain marks SHALL remain separate from UI-border characters. The Maps group
SHALL contain `◈ ▣ ◐ ◑ ◒ ◓`; the Status group SHALL contain
`⊕ ⊖ ⊗ ⊘ ⊞ ⊟`. Grouping SHALL preserve every existing entry, identity, color,
and alpha value; it SHALL not add, remove, or migrate palette entries.

#### Scenario: Browse semantically grouped glyphs
- **WHEN** a developer selects Group sorting with all palette entries visible
- **THEN** each existing palette entry appears once under its semantic group
  and no uncategorized bottom blob is rendered

#### Scenario: Distinguish borders from terrain
- **WHEN** a developer selects Group sorting
- **THEN** single-line, double-line, and mixed-line border glyphs appear in
  their respective border groups and terrain glyphs appear in Terrain

#### Scenario: Browse maps and status glyphs
- **WHEN** a developer selects Group sorting
- **THEN** `◈ ▣ ◐ ◑ ◒ ◓` appear in Maps and `⊕ ⊖ ⊗ ⊘ ⊞ ⊟` appear in Status

### Requirement: Palette Group Header presentation

In Group sorting, each visible semantic group SHALL start with a full-width
header immediately before its glyph row. Each header SHALL use the `Palette
Group Header` style at 10pt. Index and alphabetical sorting SHALL not render
group headers.

#### Scenario: Show group headers
- **WHEN** a developer selects Group sorting with all palette entries visible
- **THEN** every semantic group has one visible 10pt Palette Group Header before
  that group's glyph row

#### Scenario: Filter grouped entries
- **WHEN** a developer filters the palette while Group sorting is active
- **THEN** only groups containing at least one visible glyph render their
  Palette Group Header

#### Scenario: Use another sort
- **WHEN** a developer selects index or alphabetical sorting
- **THEN** the glyph grid renders without Palette Group Headers

### Requirement: Responsive palette glyph cards
The Ascii Palette SHALL render every visible glyph identity and glyph entirely
inside its selectable card in both portrait and landscape viewports. Group
sorting SHALL adapt its column count to available width and SHALL not force a
fixed column count that causes glyph-card overflow or horizontal scrolling.

#### Scenario: Browse Group sorting in portrait
- **WHEN** a developer selects Group sorting with all entries visible in a
  portrait viewport
- **THEN** every visible glyph card contains its identity and glyph without
  overlap or horizontal window overflow

#### Scenario: Browse another palette sort in portrait
- **WHEN** a developer selects Index or Alphabetical sorting in a portrait
  viewport
- **THEN** the glyph cards remain fully contained and selectable

### Requirement: Grid-cell glyph previews

The Ascii Settings palette grid and glyph editor preview SHALL render each glyph with the same composite grid-cell renderer used by the game view and mini-map. The previewed background, glyph tint, size, position, offset values, active font rules, and default lighting treatment SHALL match the client renderer's fully visible glyph-background cell presentation, so the palette card, editor preview, world cell, and mini-map cell communicate a consistent glyph-to-grid relationship.

#### Scenario: Palette card uses shared composite cell rendering
- **WHEN** a developer views a glyph in the Ascii Settings palette grid
- **THEN** the glyph SHALL appear in a composite grid cell using the same background and glyph rendering technology as a fully visible game-view cell
- **AND** the glyph SHALL be positioned and scaled according to that entry's committed offset values

#### Scenario: Editor preview matches grid-cell relationship
- **WHEN** a developer opens a glyph's color editor
- **THEN** the popup preview SHALL show the same composite grid-cell render used by the palette card and client renderer
- **AND** the preview SHALL use the draft color and draft offsets without committing them

### Requirement: Per-glyph offset controls

The glyph editor SHALL provide three staged sliders named `Offset X`, `Offset Y`, and `Offset Scale`. `Offset X` and `Offset Y` SHALL accept integer values from `-10` through `10`; `Offset Scale` SHALL accept integer percentage values from `-100%` through `100%`. Missing, uncustomized, or reset offset values SHALL be `0`, `0`, and `0%`.

#### Scenario: Open offset controls
- **WHEN** a developer opens a glyph editor
- **THEN** `Offset X`, `Offset Y`, and `Offset Scale` sliders SHALL be visible
- **AND** each slider SHALL show the selected glyph's current committed value or `0` when no committed value exists

#### Scenario: Stage offset changes
- **WHEN** a developer changes any offset slider
- **THEN** the glyph editor preview SHALL update immediately
- **AND** the saved palette entry SHALL remain unchanged until Confirm is clicked

#### Scenario: Confirm offset changes
- **WHEN** a developer clicks Confirm with valid color and offset values
- **THEN** the selected palette entry SHALL persist the staged color and offsets
- **AND** same-origin game instances SHALL be notified through the existing palette update behavior

#### Scenario: Reset offset draft
- **WHEN** a developer clicks Reset in a glyph editor
- **THEN** the draft color SHALL return to the default palette color
- **AND** `Offset X`, `Offset Y`, and `Offset Scale` SHALL return to `0`
- **AND** the saved palette entry SHALL remain unchanged until Confirm is clicked

#### Scenario: Cancel offset draft
- **WHEN** a developer clicks Cancel after changing color or offsets
- **THEN** the editor SHALL close
- **AND** the selected palette entry SHALL retain its previously saved color and offsets

### Requirement: Palette offset persistence and migration

Every palette entry SHALL include persisted offset values for horizontal position, vertical position, and scale. Palette loading SHALL backfill absent offset fields to `0`, reject offset values outside their allowed ranges, and preserve existing colors, alpha values, identities, and glyphs during migration.

#### Scenario: Migrate existing palette without offsets
- **WHEN** a palette saved before glyph offsets is loaded
- **THEN** every loaded entry SHALL retain its existing identity, glyph, color, and alpha
- **AND** missing `Offset X`, `Offset Y`, and `Offset Scale` values SHALL be initialized to `0`

#### Scenario: Reject invalid offsets
- **WHEN** a palette entry contains a non-integer offset or a value outside the allowed range
- **THEN** palette validation SHALL reject that palette instead of applying the invalid offset

#### Scenario: Persist complete palette offsets
- **WHEN** a palette is serialized after offset edits
- **THEN** the serialized palette SHALL include the confirmed offset values for every entry

### Requirement: Ascii Settings window remains responsive

The Ascii Settings launcher SHALL open the existing editor without freezing the browser, and its close button and backdrop SHALL close only that editor while preserving the current game and staged editor behavior.

#### Scenario: Open and close Ascii Settings repeatedly
- **WHEN** a player activates Ascii Settings, closes it, and repeats the cycle
- **THEN** the editor SHALL appear and disappear each time, and the game SHALL remain responsive after every cycle

#### Scenario: Use the editor while open
- **WHEN** a player switches tabs, filters, sorts, or selects a glyph in the open editor
- **THEN** the editor SHALL respond normally without freezing or losing the underlying game

### Requirement: Object glyph palette coverage

Every object catalog entry SHALL resolve to an editable ASCII Palette glyph with an explicit base color. The object catalog SHALL use red `♥` for Hearts, `☠` for Traps, `🕯️` for Torches, `🪙` for Gold, and `▤` for Stairs. If `🕯️` is absent from the palette inventory, it SHALL be added before Torch rendering is enabled.

#### Scenario: Heart palette color is shared
- **WHEN** the character HUD or a world Heart renders
- **THEN** both SHALL use the same palette-driven red `♥` color

#### Scenario: Torch palette entry exists
- **WHEN** a Torch object is rendered
- **THEN** the palette SHALL provide the `🕯️` glyph identity and its configured color

### Requirement: Player, enemy, and spawner glyph palette coverage

The ASCII Palette SHALL retain entries for the `🤺` Player, `🕷️` Enemy, and uppercase `S` Enemy Spawner glyphs. It SHALL assign an explicit yellow base color for Player rendering and explicit red base colors for Enemy and Enemy Spawner rendering. Client lighting MAY adjust visible brightness, but player, enemy, and spawner identity SHALL remain palette-driven.

#### Scenario: Player glyph is yellow
- **WHEN** the visible player renders as `🤺`
- **THEN** its base color SHALL come from the yellow `🤺` palette entry

#### Scenario: Enemy glyph is red
- **WHEN** a visible enemy renders as `🕷️`
- **THEN** its base color SHALL come from the red `🕷️` palette entry

#### Scenario: Spawner glyph is red
- **WHEN** a visible enemy spawner renders as `S`
- **THEN** its base color SHALL come from the red `S` palette entry
