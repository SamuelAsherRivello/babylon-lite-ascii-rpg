# Spec Delta

## MODIFIED Requirements

### Requirement: Torch grid lighting

The game layer SHALL derive a bounded lighting factor for each rendered world
cell from the grid distance to every active torch and player source. A source
SHALL contribute inside its configured radius using the existing monotonic
falloff and selected source-shadow profile. An intervening unwalkable terrain
cell SHALL apply that profile's occlusion and bleed values without altering
terrain walkability. The `X High` shadow profile SHALL contribute zero beyond
an intervening blocker. Cells outside all source radii, or hidden from every
source by an `X High` shadow profile, SHALL retain the level ambient factor.

#### Scenario: Cell inside an active source radius

- **WHEN** a visible cell is within the configured grid radius of an active
  torch or player source and no unwalkable cell blocks the straight path
- **THEN** its lighting factor SHALL be greater than the ambient factor and no
  greater than the maximum lit factor

#### Scenario: Cell outside active source radii

- **WHEN** a visible cell is outside every active source radius
- **THEN** its lighting factor SHALL equal the level ambient factor

#### Scenario: Cell inside a source radius but behind blocked terrain

- **WHEN** a wall, medium-water, deep-water, or other unwalkable terrain cell
  lies between an active source and an in-range target cell whose source uses
  the `X High` shadow profile
- **THEN** that source SHALL add no light to the target cell, including when a
  walkable path could reach the target around the blocker

#### Scenario: Overlapping torch fields

- **WHEN** a visible cell is within more than one active source radius
- **THEN** only sources with an unobstructed straight path SHALL contribute,
  and the combined factor SHALL remain bounded by the configured maximum and
  SHALL not become darker because another source is added

### Requirement: Palette-based visible rendering

The renderer SHALL apply the cell lighting factor to the active palette style
when submitting a visible glyph. Lighting SHALL affect rendered color and
opacity together; it SHALL not rewrite terrain cells, character cells, palette
entries, or the glyph atlas. A torch glyph SHALL remain visible as a character
layer glyph while its surrounding cells receive the derived lighting.

#### Scenario: Unlit palette style uses ambient lighting

- **WHEN** a visible glyph has no unobstructed torch or player contribution
- **THEN** its submitted style SHALL be the active palette style modulated by
  the ambient factor

#### Scenario: Lit palette style is transient

- **WHEN** a cell is rendered inside an unobstructed source field
- **THEN** the submitted style SHALL be brighter than its ambient-only style
  without changing the saved palette or terrain data

## ADDED Requirements

### Requirement: Terrain shadows without Babylon light objects

The lighting runtime SHALL form straight grid shadows from the terrain's
walkability and SHALL keep using palette modulation rather than Babylon light
objects or shadow generators. An unwalkable target cell SHALL receive light
from a source that can reach it directly, but SHALL apply the selected source
shadow profile to that source's light beyond it. Light SHALL not travel around
corners. Level ambient SHALL continue to illuminate shadowed cells according
to the ambient setting.

#### Scenario: Source-facing blocker is lit

- **WHEN** an active source reaches an unwalkable cell within its radius with
  no earlier blocker on the straight path
- **THEN** that unwalkable cell SHALL receive the source contribution

#### Scenario: Straight shadow behind blocker

- **WHEN** a cell lies behind an unwalkable terrain cell on its straight path
  from an active source using the `X High` shadow profile
- **THEN** that source SHALL contribute no light to the cell even if the cell
  is within the source radius

#### Scenario: Lower shadow profile bleeds source light

- **WHEN** a cell lies behind an unwalkable terrain cell on its straight path
  from an active source using `Low`, `Med`, or `High` shadow settings
- **THEN** that source SHALL retain the profile's configured bleed fraction,
  with subsequent blockers applying the configured occlusion again

#### Scenario: Closed diagonal corner

- **WHEN** a straight path to a target touches an unwalkable cell at a grid
  corner before reaching the target
- **THEN** that source SHALL contribute no light through that corner

#### Scenario: Another source reaches the shadow

- **WHEN** a cell is blocked from one source but has an unobstructed straight
  path to another active source
- **THEN** the unblocked source SHALL brighten the cell according to its
  existing profile and falloff

#### Scenario: Ambient endpoint in a shadow

- **WHEN** ambient is set to `0` or `1` and a cell is blocked from every
  active source
- **THEN** the cell SHALL use factor `0` or `1`, respectively

### Requirement: Fixed source lighting presets

The Torch Lighting, Player Lighting, Torch Shadow, and Player Shadow settings
SHALL each cycle the same five fixed labels: `Off`, `Low`, `Med`, `High`, and
`X High`. Lighting labels SHALL display radius (`R`), maximum light factor
(`M`), and falloff exponent (`F`). Shadow labels SHALL display terrain
occlusion (`O`) and shadow bleed (`B`) next to the corresponding values.
The fixed preset shadow values SHALL be `O0 B1`, `O0.25 B0.75`, `O0.5 B0.5`,
`O0.75 B0.25`, and `O1 B0` from `Off` through `X High`. `O` SHALL control
how much source light each additional unwalkable blocker removes and `B`
SHALL control the fraction retained after the first blocker. `X High` SHALL
therefore retain complete hard shadows, while lower active presets can bleed
source light into them.

#### Scenario: Cycling a source preset

- **WHEN** the player activates any source-lighting or source-shadow setting
- **THEN** that setting SHALL advance through exactly `Off`, `Low`, `Med`,
  `High`, and `X High` before returning to `Off`, without changing any other
  source setting

#### Scenario: Inspecting the shadow values

- **WHEN** a source-shadow preset is displayed in settings
- **THEN** its label SHALL include that preset's `O` and `B` values

## REMOVED Requirements

### Requirement: Shadowless and Babylon-light-free behavior

**Reason**: Its ban on terrain occlusion and its equal-light wall scenario
conflict with the requested straight shadows.

**Migration**: Use the terrain-shadow requirement above. Existing lighting
settings and saved world data need no migration.
