# palette-grid-lighting Specification

## Purpose
Provides a lightweight lighting experiment for the top-down ASCII scene by
modulating visible palette styles from deterministic torch positions on the
world grid.

## Requirements

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
when submitting a visible glyph. When Glyph Background is enabled, the
renderer SHALL first derive and compose the opaque background from that same
palette color using Background Darkness, then SHALL apply the lighting factor
once to the combined background-and-glyph result in both game and mini-map
views. The mini-map SHALL apply this factor to its base glyph color before any
optional GPU light-pass overlay. When the GPU light pass is enabled, the
mini-map SHALL use the same cached torch/player light samples and additive
light color as the game view, without treating that overlay as a replacement
for base glyph lighting. Lighting SHALL affect rendered color and opacity
together; it SHALL not rewrite terrain cells, character cells, palette
entries, or the glyph atlas. A torch glyph SHALL remain visible as a character
layer glyph while its surrounding cells receive the derived lighting.

#### Scenario: Unlit palette style uses ambient lighting

- **WHEN** a visible glyph has no unobstructed torch or player contribution
- **THEN** its submitted style SHALL be the active palette style modulated by
  the ambient factor in both the game view and mini-map view

#### Scenario: Lit palette style is transient

- **WHEN** a cell is rendered inside an unobstructed source field
- **THEN** the submitted style SHALL be brighter than its ambient-only style
  without changing the saved palette or terrain data in either view

#### Scenario: Background preserves relative darkness

- **WHEN** a cell is rendered with Background Darkness `50`
- **THEN** lighting SHALL brighten or dim the glyph and background together
  while preserving the background's darker relationship to the glyph in both
  views

#### Scenario: Minimap GPU overlay does not replace base lighting

- **WHEN** the optional GPU light pass is enabled for a discovered mini-map
  cell
- **THEN** the mini-map SHALL render that cell from its lighting-modulated
  base palette color and SHALL add only the shared visual light composite on
  top, without rendering a full-bright base color first

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

### Requirement: Level ambient and source profiles

The game SHALL maintain one level-wide ambient value in the inclusive range
`0..1`, defaulting to `0.6` when local storage is empty. Ambient `0` SHALL provide no global illumination;
ambient `1` SHALL fully light every visible cell and SHALL make torch and player
source changes produce no visual difference. Torch Lighting, Player Lighting,
Torch Shadow, and Player Shadow profiles SHALL be independently selectable
from exactly `Off`, `Low`, `Med`, `High`, and `X High`. When their stored
preferences are absent, Player Lighting SHALL default to `X High` and Player
Shadow SHALL default to `High`; existing stored profile choices SHALL be
preserved.

#### Scenario: Ambient endpoint behavior

- **WHEN** the level ambient value is `0` or `1`
- **THEN** `0` SHALL leave only active source contribution and `1` SHALL
  produce a fully lit scene regardless of source state; GPU source-composite
  intensity SHALL continuously scale by `1 - ambient`, so at `1` source,
  shadow, falloff, and bleed controls have no visible result

#### Scenario: Full ambient hides the GPU source composite

- **WHEN** Light Ambient is `1` and `Lighting GPU Light Pass` is enabled
- **THEN** the GPU source-composite contribution SHALL naturally evaluate to
  zero through ambient-headroom scaling

#### Scenario: Independent source profiles

- **WHEN** any torch or player lighting or shadow profile control is changed
- **THEN** that source setting SHALL use its own selected state without
  changing the other source settings

#### Scenario: Missing player preferences use the selected defaults

- **WHEN** Player Lighting and Player Shadow have no stored preferences
- **THEN** the game SHALL display and apply Player Lighting `X High` and
  Player Shadow `High`

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
  Lighting `Low`, Player Lighting `X High`, Torch Shadow `X High`, Player
  Shadow `High`, GPU Light Pass enabled, and ambient `0.6`

### Requirement: Bounded player GPU shadow bleed

When `Lighting GPU Light Pass` is enabled, the game SHALL provide a persisted
`Player GPU Shadow Bleed Range` setting with the click-through values `0`,
`1`, `2`, `3`, `4`, and `6` grid cells. The setting SHALL default to `2` when
no stored value exists and SHALL be cleared by Reset Settings. It SHALL affect
only the GPU presentation of player light, not authoritative grid lighting,
world data, palette data, collision, or player movement.

#### Scenario: Default player penumbra range

- **WHEN** no stored player GPU shadow-bleed preference exists
- **THEN** `Player GPU Shadow Bleed Range` SHALL display `2` and the GPU pass
  SHALL use a two-cell maximum simulated player penumbra

#### Scenario: Click through the supported ranges

- **WHEN** a player activates `Player GPU Shadow Bleed Range`
- **THEN** it SHALL advance through `0`, `1`, `2`, `3`, `4`, and `6` before
  returning to `0`, without changing any other lighting setting

### Requirement: Player shadow core preserves only ambient light

At every ambient level, a player-light target with an intervening unwalkable
blocker SHALL receive no direct player GPU composite. The GPU pass SHALL render
a dim, rapidly fading, simulated player penumbra only within the selected
number of grid cells immediately behind the first blocker on that player's
straight grid-light path. Cells beyond the selected range SHALL receive zero
player GPU composite; the player GPU composite SHALL not leak across the
shadow boundary through unrestricted soft blur. Existing ambient illumination
SHALL remain able to make the hard-shadow core visible when ambient is above
`0`.

#### Scenario: Unobstructed player light remains direct

- **WHEN** a visible cell has an unobstructed path to the player within the
  selected player-light radius
- **THEN** it SHALL receive the normal player GPU light presentation according
  to the selected player brightness and falloff

#### Scenario: Player shadow fringe is bounded

- **WHEN** a visible cell is behind the first unwalkable blocker from the
  player and its shadow distance is within the selected `Player GPU Shadow
  Bleed Range`
- **THEN** it SHALL receive only the simulated dim player penumbra, with less
  presentation brightness farther behind the blocker

#### Scenario: Ambient alone can illuminate the player shadow core

- **WHEN** a visible cell lies beyond the selected player GPU shadow-bleed
  range behind an unwalkable blocker and ambient is above `0`
- **THEN** it SHALL receive zero player GPU composite contribution and only
  the existing ambient presentation from this player-light path

#### Scenario: Player shadow core stays dark at zero ambient

- **WHEN** a visible cell lies beyond the selected player GPU shadow-bleed
  range behind an unwalkable blocker and ambient is `0`
- **THEN** it SHALL receive zero player GPU composite contribution and no
  ambient illumination

#### Scenario: Another source can still illuminate the player shadow

- **WHEN** a visible cell is in the player's hard-shadow core but has an
  unobstructed contribution from a torch or another applicable source
- **THEN** that other source SHALL remain able to illuminate the cell according
  to its own existing settings

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

### Requirement: Terrain shadows without Babylon light objects

The lighting client SHALL form straight grid shadows from the terrain's
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

### Requirement: Per-realm ambient preferences
The game SHALL maintain independently persisted ambient values for Overground
and Underground in the inclusive range `0..1`. Missing stored values SHALL
initialize and persist as `0.9` for Overground and `0.1` for Underground. The
active realm's ambient value SHALL be the level-wide ambient input to its
lighting calculation.

#### Scenario: Active realm selects its ambient
- **WHEN** the player transfers from Overground to Underground
- **THEN** lighting switches from the stored Overground ambient value to the
  stored Underground ambient value without changing either saved preference

#### Scenario: Missing values use realm defaults
- **WHEN** neither realm ambient preference exists in local storage
- **THEN** Overground initializes to `0.9` and Underground initializes to
  `0.1`

### Requirement: Realm ambient control surface
The Lighting window SHALL replace the single ambient control with controls
labeled `Ambient Overground` and `Ambient Underground`. Each control SHALL
display and adjust only its own value in `0.05` increments clamped to `0..1`.

#### Scenario: Adjusting inactive ambient does not alter the current scene
- **WHEN** the player is active in Overground and adjusts Ambient Underground
- **THEN** the saved Underground preference changes while current Overground
  lighting remains unchanged

#### Scenario: Reset restores both realm defaults
- **WHEN** the user activates Reset Settings
- **THEN** both realm ambient preferences are cleared and reload restores
  Ambient Overground `0.9` and Ambient Underground `0.1`

### Requirement: Optional GPU light-pass presentation

The game SHALL provide a `Lighting GPU Light Pass` checkbox in Settings. Its value SHALL
persist in browser local storage, default to unchecked when no stored value
exists, and be cleared by Reset Settings. When checked, the game SHALL render
a visual-only soft warm light composite from the current visible torch and
player light field after the normal ASCII glyph render. The composite SHALL
respect the existing source radius, falloff, terrain-shadow, and ambient
results, but SHALL NOT alter the palette, glyph data, terrain, characters,
world generation, collision, movement, or authoritative lighting factors.

#### Scenario: Default sprite-only presentation

- **WHEN** no stored GPU-light-pass preference exists
- **THEN** `Lighting GPU Light Pass` SHALL render checked and the game SHALL use
  the GPU light-pass presentation

#### Scenario: Enable the GPU light pass

- **WHEN** a player checks `Lighting GPU Light Pass` while the game is visible
- **THEN** the current visible scene SHALL gain a soft warm light composite
  without changing any gameplay state or the existing grid-shadow boundaries

#### Scenario: Disable the GPU light pass

- **WHEN** a player unchecks `Lighting GPU Light Pass`
- **THEN** the composite SHALL be removed immediately and the scene SHALL
  return to the sprite-only lighting presentation without reloading the world

#### Scenario: Persist and reset the preference

- **WHEN** a player reloads after setting `Lighting GPU Light Pass` or activates Reset
  Settings
- **THEN** the saved checkbox value SHALL be restored after reload or cleared
  to unchecked after reset, respectively

### Requirement: GPU light pass follows visible lighting changes

When `Lighting GPU Light Pass` is enabled, the visual composite SHALL update whenever
the visible region, player position, torch field, palette color, or active
lighting setting changes. It SHALL use only the currently visible lighting
inputs and SHALL not leave light trails at a former player position.

#### Scenario: Player movement refreshes the composite

- **WHEN** the player moves to a new walkable cell while `Lighting GPU Light Pass` is
  enabled
- **THEN** the composite SHALL reflect the player's new light position and
  SHALL not retain a composite contribution at the former position

#### Scenario: Zoom or resize refreshes the composite

- **WHEN** zoom or viewport size changes while `Lighting GPU Light Pass` is enabled
- **THEN** the composite SHALL align with the newly visible world cells
