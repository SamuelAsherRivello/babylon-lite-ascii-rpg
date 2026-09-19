# Spec Delta

## MODIFIED Requirements

### Requirement: Bordered connected playable terrain

The generated terrain SHALL use `W` for non-walkable walls, `•` for ordinary
walkable ground, `~` for walkable shallow water, `≈` for non-walkable medium
water, and `▓` for non-walkable deep water. The outermost row and column SHALL
remain walls. After cave and water generation, the final walkable region SHALL
be connected and meet the configured minimum walkable-area requirement.

#### Scenario: Outer border is non-walkable

- **WHEN** a world is generated
- **THEN** every cell in the outermost row and column SHALL be `W` and have
  `walkable: false`

#### Scenario: Water depth controls traversal

- **WHEN** a generated terrain cell contains `~`
- **THEN** the cell SHALL be walkable

#### Scenario: Deeper water blocks traversal

- **WHEN** a generated terrain cell contains `≈` or `▓`
- **THEN** the cell SHALL be non-walkable

#### Scenario: Final playable region is connected

- **WHEN** a generated world is accepted
- **THEN** the final ground and shallow-water cells used for movement SHALL
  form one connected region large enough to contain the player start cell

#### Scenario: Player region is connected

- **WHEN** a generated world is accepted
- **THEN** its final playable region SHALL consist of one connected walkable
  area large enough to contain the player start cell

### Requirement: Layered world data

The Babylon Lite game layer SHALL own a world with explicit terrain layers and
a character layer. Terrain cells SHALL be present for every world position and
SHALL retain their source kind, glyph, depth where applicable, walkability,
color, and alpha. Character cells MAY be empty or contain `P` or other
character-layer glyphs such as `T`; characters SHALL NOT rewrite terrain data.

#### Scenario: Player occupies a walkable terrain cell

- **WHEN** the player is placed at a valid start cell
- **THEN** that cell SHALL retain its walkable terrain in the terrain layer and
  contain `P` in the character layer

#### Scenario: Water retains terrain identity under a character

- **WHEN** a character occupies a shallow-water cell
- **THEN** the visible character SHALL be rendered while the underlying water
  glyph, depth, and walkability remain available in the terrain layer

### Requirement: Top-most cell rendering

The Babylon Lite game layer SHALL render at most one visible glyph for each
cell. A character glyph SHALL take precedence over the terrain glyph at the
same position, and the visible glyph SHALL use the active palette style when
rendered. Empty character cells SHALL render the terrain glyph and its active
style.

#### Scenario: Character hides terrain

- **WHEN** a cell contains terrain `•`, `~`, `≈`, or `▓` and a character
- **THEN** the rendered cell SHALL show only the character glyph

#### Scenario: Empty character layer shows terrain

- **WHEN** a cell has terrain `W`, `•`, `~`, `≈`, or `▓` and no character
- **THEN** the rendered cell SHALL show the terrain glyph with its configured
  style

## ADDED Requirements

### Requirement: Organic nested water generation

The water pass SHALL place approximately 20% of the interior non-wall ground
cells into multiple independent organic lakes. Each lake SHALL target roughly
5-20 grid cells at the default grid scale. Within each water shape, the
deepest cells SHALL occupy the center, medium-depth cells SHALL wrap the deep
cells, and shallow cells SHALL form the outer water edge.

#### Scenario: Water coverage is approximately twenty percent

- **WHEN** a default world is generated
- **THEN** the number of water cells SHALL be approximately 20% of the
  interior non-wall ground cells, within the documented implementation
  tolerance

#### Scenario: Water is split into small lakes

- **WHEN** a default world is generated
- **THEN** each generated lake SHALL contain between 5 and 20 water cells,
  except when the available cave geometry is too small to fit a complete lake

#### Scenario: Depth bands are nested

- **WHEN** a water shape contains all three depth levels
- **THEN** every deep cell SHALL be enclosed by the medium band and every
  medium cell SHALL be enclosed by or adjacent toward the outside to shallow
  water, subject to the organic boundary

#### Scenario: Water generation is seed-stable

- **WHEN** two worlds use identical dimensions, generation parameters, and
  seed
- **THEN** their water positions, depth glyphs, colors, and walkability SHALL
  match exactly

### Requirement: Player placement after water validation

The player position pass SHALL select a valid cell from the final connected
walkable region after water depth and walkability have been derived. The player
SHALL never start in a wall, medium water, or deep water.

#### Scenario: Player starts outside blocked water

- **WHEN** a world containing water is generated
- **THEN** the player start cell SHALL be ordinary ground or shallow water and
  SHALL have `walkable: true`
