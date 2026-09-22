# Spec Delta

## Purpose

Provides a lightweight lighting experiment for the top-down ASCII scene by
modulating visible palette styles from deterministic torch positions on the
world grid.

## ADDED Requirements

### Requirement: Torch grid lighting

The game layer SHALL derive a bounded lighting factor for each rendered world
cell from the grid distance to every torch. Each torch SHALL contribute inside
its configured radius using a monotonic falloff, and cells outside all torch
radii SHALL retain the ambient factor. Lighting SHALL be circular in grid
space and SHALL not inspect or alter terrain walkability.

#### Scenario: Cell inside an active source radius

- **WHEN** a visible cell is within the configured grid radius of an active
  torch or player source
- **THEN** its lighting factor SHALL be greater than the ambient factor and no
  greater than the maximum lit factor

#### Scenario: Cell outside active source radii

- **WHEN** a visible cell is outside every active source radius
- **THEN** its lighting factor SHALL equal the level ambient factor

#### Scenario: Overlapping torch fields

- **WHEN** a visible cell is within more than one torch radius
- **THEN** the combined factor SHALL remain bounded by the configured maximum
  and SHALL not become darker because another torch is added

### Requirement: Palette-based visible rendering

The renderer SHALL apply the cell lighting factor to the active palette style
when submitting a visible glyph. Lighting SHALL affect rendered color and
opacity together; it SHALL not rewrite terrain cells, character cells, palette
entries, or the glyph atlas. A torch glyph SHALL remain visible as a character
layer glyph while its surrounding cells receive the derived lighting.

#### Scenario: Unlit palette style uses ambient lighting

- **WHEN** a visible glyph has no torch contribution
- **THEN** its submitted style SHALL be the active palette style modulated by
  the ambient factor

#### Scenario: Lit palette style is transient

- **WHEN** a cell is rendered inside a torch field
- **THEN** the submitted style SHALL be brighter than its ambient-only style
  without changing the saved palette or terrain data

### Requirement: Client owns glyph opacity and brightness

The lighting client SHALL own rendered glyph opacity and brightness. The
Ascii Palette SHALL provide an editable base color but SHALL NOT provide a
user-editable alpha or brightness value. Lighting SHALL derive opacity from the
cell factor while preserving the selected base hue.

#### Scenario: Palette editor has no alpha control

- **WHEN** a developer opens a glyph editor
- **THEN** the editor SHALL allow base color editing but SHALL not expose an
  alpha slider or other opacity control

#### Scenario: Client controls opacity

- **WHEN** a cell's lighting factor changes
- **THEN** its submitted opacity SHALL change with the factor even though the
  saved palette entry remains unchanged

### Requirement: Shadowless and Babylon-light-free behavior

The lighting experiment SHALL use grid coordinates and palette modulation only.
It SHALL not create Babylon light objects, shadow generators, ray casts, or
terrain occlusion rules. Walls SHALL receive light using the same distance
calculation as other cells.

#### Scenario: Wall does not cast a shadow

- **WHEN** a wall cell and a floor cell are at the same grid distance from a
  torch
- **THEN** their lighting factors SHALL be equal before palette styles are
  applied

### Requirement: Level ambient and source profiles

The game SHALL maintain one level-wide ambient value in the inclusive range
`0..1`, defaulting to `0.6` when local storage is empty. Ambient `0` SHALL provide no global illumination;
ambient `1` SHALL fully light every visible cell and SHALL make torch and player
source changes produce no visual difference. Torch and player source profiles
SHALL be independently selectable from exactly `Off`, `Low`, `Med`, and `High`.

#### Scenario: Ambient endpoint behavior

- **WHEN** the level ambient value is `0` or `1`
- **THEN** `0` SHALL leave only active source contribution and `1` SHALL
  produce a fully lit scene regardless of source state

#### Scenario: Independent source profiles

- **WHEN** the torch and player profile controls are changed separately
- **THEN** each source type SHALL use its own selected state without changing
  the other source type

### Requirement: Ambient control surface

The UI SHALL provide a control immediately above Zoom displaying the current
value in the form `Light Ambient + <value> -`. Increment and decrement actions
SHALL change the value by `0.05` and clamp it to `0..1`.

#### Scenario: Ambient value is adjusted

- **WHEN** the user activates the ambient plus or minus action
- **THEN** the displayed value and game-layer lighting SHALL update together
  without React rendering individual world cells

### Requirement: Settings reset

The UI SHALL provide a `Reset Settings` button at the bottom of the Settings
section. Activating it SHALL clear local storage and reload the page so the
cleared-storage defaults are restored.

#### Scenario: Reset settings restores defaults

- **WHEN** the user activates `Reset Settings`
- **THEN** local storage SHALL be empty and the page SHALL reload with Torch
  `Low`, Player `High`, and ambient `0.6`

### Requirement: Stable configuration and bounded work

The lighting calculation SHALL use bounded source radius, maximum, falloff,
and ambient values. Rendering SHALL calculate lighting only for visible cells
and SHALL reuse the result while a cell's lighting inputs remain unchanged.

#### Scenario: Resize and zoom recompute visible lighting

- **WHEN** the viewport or zoom changes the visible region
- **THEN** visible cells SHALL be rendered using lighting for their current
  world coordinates without changing the world or torch positions

#### Scenario: Player movement refreshes the light field

- **WHEN** the player moves to a new walkable cell
- **THEN** the complete visible region SHALL be recomputed from the new player
  position so the previous position does not retain player light
