# Spec Delta

## ADDED Requirements

### Requirement: Grid-cell glyph previews

The Ascii Settings palette grid and glyph editor preview SHALL render each glyph on a visible white square representing one world grid cell. The glyph's previewed size and position SHALL use the same committed offset values and active font rules that the world renderer uses for that glyph, so the palette card, editor preview, and world cell communicate a consistent glyph-to-grid relationship.

#### Scenario: Palette card shows grid-cell square
- **WHEN** a developer views a glyph in the Ascii Settings palette grid
- **THEN** the glyph SHALL appear over a white square representing one grid cell
- **AND** the glyph SHALL be positioned and scaled according to that entry's committed offset values

#### Scenario: Editor preview matches grid-cell relationship
- **WHEN** a developer opens a glyph's color editor
- **THEN** the popup preview SHALL show the same white grid-cell square behind the glyph
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
