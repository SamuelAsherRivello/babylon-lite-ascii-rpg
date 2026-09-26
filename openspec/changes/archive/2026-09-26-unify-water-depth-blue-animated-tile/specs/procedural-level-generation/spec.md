# Spec Delta

## MODIFIED Requirements

### Requirement: Bordered connected playable terrain

The generated terrain SHALL use `W` for non-walkable walls, `•` for ordinary
walkable ground, and one canonical water glyph for non-walkable water. The
outermost row and column SHALL remain walls. After cave and water generation,
the final walkable region SHALL be connected and meet the configured minimum
walkable-area requirement.

#### Scenario: Outer border is non-walkable

- **WHEN** a world is generated
- **THEN** every cell in the outermost row and column SHALL be `W` and have
  `walkable: false`

#### Scenario: Water depth controls traversal

- **WHEN** a generated terrain cell contains canonical water
- **THEN** the cell SHALL be non-walkable

#### Scenario: Deeper water blocks traversal

- **WHEN** a generated terrain cell contains canonical water
- **THEN** the cell SHALL be non-walkable

#### Scenario: Final playable region is connected

- **WHEN** a generated world is accepted
- **THEN** the final ground cells used for movement SHALL form one connected
  region large enough to contain the player start cell

#### Scenario: Player region is connected

- **WHEN** a generated world is accepted
- **THEN** its final playable region SHALL consist of one connected walkable
  area large enough to contain the player start cell

### Requirement: Top-most cell rendering

The Babylon Lite game layer SHALL render at most one visible glyph for each
cell. A character glyph SHALL take precedence over the terrain glyph at the
same position, and the visible glyph SHALL use the active palette style when
rendered. Empty character cells SHALL render the terrain glyph and its active
style. When both a player and a torch would otherwise target the same
position, the player glyph SHALL remain the visible character.

#### Scenario: Character hides terrain

- **WHEN** a cell contains terrain `•`, canonical water, or `W` and a character
- **THEN** the rendered cell SHALL show only the character glyph

#### Scenario: Torch hides terrain

- **WHEN** a cell contains terrain `•` or `W` and character `T`
- **THEN** the rendered cell SHALL show only `T`

#### Scenario: Empty character layer shows terrain

- **WHEN** a cell has terrain `W`, `•`, or canonical water and no character
- **THEN** the rendered cell SHALL show the terrain glyph with its configured
  style

### Requirement: Sparse organic nested water generation

The water pass SHALL make water a roughly 50% generation event by default.
When selected, it SHALL place one or two independent organic lakes, with the
first lake biased toward the center of the generated playable region so a
normal zoom-5 starting view has a meaningful chance of showing water. Each
lake SHALL target roughly 50-240 grid cells at the default world scale, with
occasional larger bodies up to roughly 480 cells. Every cell within each
selected water shape SHALL use the one canonical non-walkable water depth.

#### Scenario: Water appears in about half of default worlds

- **WHEN** a default world is generated
- **THEN** water SHALL be present in approximately half of independently
  seeded worlds

#### Scenario: Water uses one or two sparse large bodies

- **WHEN** a default world is generated
- **THEN** the world SHALL contain zero, one, or two lakes, and each selected
  lake SHALL contain roughly 50-240 water cells, with occasional bodies up to
  roughly 480 cells, except when the available cave geometry is too small

#### Scenario: A lake uses one depth

- **WHEN** a water shape is generated
- **THEN** every water cell in that shape SHALL use the canonical water depth
- **AND** every such cell SHALL have `walkable: false`

#### Scenario: Depth bands are nested

- **WHEN** a water shape is generated
- **THEN** it SHALL contain only the canonical water depth
- **AND** it SHALL contain no shallow, medium, or deep depth band

#### Scenario: Water generation is seed-stable

- **WHEN** two worlds use identical dimensions, generation parameters, and
  seed
- **THEN** their water positions, canonical depth, colors, and walkability
  SHALL match exactly

### Requirement: Player placement after water validation

The player position pass SHALL select a valid cell from the final connected
walkable region after canonical water and walkability have been derived. The
player SHALL never start in a wall or water.

#### Scenario: Player starts outside blocked water

- **WHEN** a world containing water is generated
- **THEN** the player start cell SHALL be ordinary ground and have
  `walkable: true`
