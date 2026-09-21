# glyph-background-layout Specification

## Purpose
Provides a persisted Layout control surface and an optional opaque background treatment that improves cell readability while preserving the ASCII game's existing fog, palette, lighting, and responsive behavior.

## Requirements

### Requirement: Layout controls

The Ascii Settings window SHALL expose a top-level tab labeled `Layout`. The Layout tab SHALL provide a `Glyph Background` control with exactly `On` and `Off` choices and a `Background Darkness` slider constrained to integer values from `0` through `100`.

#### Scenario: Open Layout tab

- **WHEN** a user opens Ascii Settings and selects Layout
- **THEN** the Layout tab and both controls SHALL be visible and usable

#### Scenario: Change background controls

- **WHEN** a user changes Glyph Background or Background Darkness
- **THEN** the current game presentation SHALL update without requiring a page reload

### Requirement: Default and persisted layout preferences

The application SHALL persist Glyph Background and Background Darkness in browser local storage. Missing or invalid values SHALL initialize to Glyph Background `On` and Background Darkness `50`, and those defaults SHALL be written to storage. Reset Settings SHALL clear the preferences and a subsequent initialization SHALL restore those defaults.

#### Scenario: First initialization

- **WHEN** no valid layout preferences exist in local storage
- **THEN** Glyph Background SHALL be `On`, Background Darkness SHALL be `50`, and both values SHALL be stored

#### Scenario: Restore saved preferences

- **WHEN** a user reloads after changing either layout preference
- **THEN** the saved control values SHALL be restored and applied to the game view

#### Scenario: Reset layout preferences

- **WHEN** a user activates Reset Settings
- **THEN** the layout preferences SHALL be cleared and the reloaded game SHALL use `On` and `50`

### Requirement: Darkness mapping

When Glyph Background is On, the background color SHALL be derived from the rendered glyph's palette color by moving each RGB channel toward black according to Background Darkness. Darkness `0` SHALL preserve the glyph color, darkness `50` SHALL reduce each RGB channel by half, and darkness `100` SHALL produce black. The background SHALL be opaque rather than transparent.

#### Scenario: Darkness endpoints

- **WHEN** Background Darkness is `0` or `100`
- **THEN** the background SHALL use the unchanged glyph color or black, respectively

#### Scenario: Default darkness

- **WHEN** Background Darkness is `50`
- **THEN** each background RGB channel SHALL equal one half of the corresponding glyph color channel

### Requirement: Discovered-cell background composition

For every discovered game-view cell whose glyph is rendered, including space glyphs, the renderer SHALL compose one opaque grid-sized background behind the glyph and SHALL apply the cell's existing lighting to the combined background-and-glyph result. When Glyph Background is Off, the renderer SHALL preserve the existing glyph-only presentation.

#### Scenario: Compose a discovered space cell

- **WHEN** a discovered cell resolves to a space glyph and the background is On
- **THEN** the cell SHALL render its opaque grid-sized background using the selected darkness

#### Scenario: Compose a discovered glyph cell

- **WHEN** a discovered cell resolves to any non-space glyph and the background is On
- **THEN** the opaque square SHALL occupy the grid cell behind the glyph, and both SHALL receive the same subsequent cell lighting

#### Scenario: Disable composition

- **WHEN** Glyph Background is Off
- **THEN** the game view SHALL render the current glyph-only result without a background square

### Requirement: Fog exclusion

The background SHALL follow the same fog eligibility as the glyph. An undiscovered or fogged cell SHALL render neither its background nor its glyph, and a previously displayed background SHALL be hidden when a visible slot becomes fogged.

#### Scenario: Fogged cell

- **WHEN** a cell is undiscovered in the active realm
- **THEN** neither its background nor its glyph SHALL be submitted for rendering

#### Scenario: Cell becomes fogged after a viewport shift

- **WHEN** a screen slot changes from a discovered cell to an undiscovered cell
- **THEN** the previous combined presentation SHALL be hidden during that render pass
