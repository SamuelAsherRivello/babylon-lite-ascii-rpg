# Spec Delta

## MODIFIED Requirements

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
