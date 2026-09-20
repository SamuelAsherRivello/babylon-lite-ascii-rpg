# procedural-level-generation Specification

## Purpose
Provides an explicit-size procedural ASCII world with connected walkable
terrain, separate terrain and character layers, and deterministic rendering
precedence for the current player.

## Requirements

### Requirement: Explicit procedural world generation

The Babylon Lite game layer SHALL generate a world from explicit positive
`rows` and `columns` inputs independent of the browser viewport dimensions.

#### Scenario: Generate requested dimensions

- **WHEN** the generator receives `rows: 20` and `columns: 40`
- **THEN** the resulting world SHALL contain exactly 20 rows and 40 columns

### Requirement: Configurable cave generation

The Babylon Lite game layer SHALL accept a wall-fill percentage, a
smoothing-pass count, and an optional caller-provided seed. It SHALL apply the
configured values while using the fixed light 4–5 cellular-automata rule for
neighbor classification.

#### Scenario: Seeded generation is repeatable

- **WHEN** the generator is called twice with identical dimensions, fill,
  smoothing, and seed values
- **THEN** both generated terrain layouts SHALL be identical

#### Scenario: Fill and smoothing affect generation

- **WHEN** the generator receives valid wall-fill and smoothing values
- **THEN** it SHALL use those values rather than silently replacing them with
  viewport or player defaults

### Requirement: Resolved generation seed

Each generated world SHALL have a resolved seed. When the caller supplies a
seed, the Babylon Lite game layer SHALL use and retain that seed. When the
caller omits a seed, the game layer SHALL create and retain a fresh seed for
that generation so a new level is random without becoming unrepeatable.

#### Scenario: Omitted seed creates a fresh reproducible level identity

- **WHEN** the generator creates a world without a caller-provided seed
- **THEN** the returned world SHALL expose the generated seed used for its
  terrain layout

#### Scenario: Caller-provided seed is retained

- **WHEN** the generator creates a world with a caller-provided seed
- **THEN** the returned world SHALL expose that same seed as its resolved seed

#### Scenario: Retained seed reproduces the level

- **WHEN** a generated world's resolved seed is passed to the generator with
  the same dimensions and generation parameters
- **THEN** the resulting terrain layout SHALL match the original layout

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

#### Scenario: Torch occupies a walkable terrain cell

- **WHEN** a torch is placed in a valid generated world
- **THEN** that cell SHALL retain its underlying walkable terrain and contain
  `T` in the character layer

### Requirement: Top-most cell rendering

The Babylon Lite game layer SHALL render at most one visible glyph for each
cell. A character glyph SHALL take precedence over the terrain glyph at the
same position, and the visible glyph SHALL use the active palette style when
rendered. Empty character cells SHALL render the terrain glyph and its active
style. When both a player and a torch would otherwise target the same
position, the player glyph SHALL remain the visible character.

#### Scenario: Character hides terrain

- **WHEN** a cell contains terrain `•`, `~`, `≈`, or `▓` and a character
- **THEN** the rendered cell SHALL show only the character glyph

#### Scenario: Torch hides terrain

- **WHEN** a cell contains terrain `•` or `W` and character `T`
- **THEN** the rendered cell SHALL show only `T`

#### Scenario: Empty character layer shows terrain

- **WHEN** a cell has terrain `W`, `•`, `~`, `≈`, or `▓` and no character
- **THEN** the rendered cell SHALL show the terrain glyph with its configured
  style

### Requirement: Sparse organic nested water generation

The water pass SHALL make water a roughly 50% generation event by default. When
selected, it SHALL place one or two independent organic lakes, with the first
lake biased toward the center of the generated playable region so a normal
zoom-5 starting view has a meaningful chance of showing water. Each lake SHALL
target roughly 50-240 grid cells at the default world scale, with occasional
larger bodies up to roughly 480 cells. Within each water shape, the
deepest cells SHALL occupy the center, medium-depth cells SHALL wrap the deep
cells, and shallow cells SHALL form the outer water edge.

#### Scenario: Water appears in about half of default worlds

- **WHEN** a default world is generated
- **THEN** water SHALL be present in approximately half of independently
  seeded worlds

#### Scenario: Water uses one or two sparse large bodies

- **WHEN** a default world is generated
- **THEN** the world SHALL contain zero, one, or two lakes, and each selected
  lake SHALL contain roughly 50-240 water cells, with occasional bodies up to
  roughly 480 cells, except when the available cave geometry is too small

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

### Requirement: Deterministic realm profile generation
The procedural generator SHALL support explicit realm profiles whose terrain
identity, walkability target, and per-feature occurrence probability and
parameters are independent. Given the same world identity, dimensions, realm
profile, and generation parameters, a realm's terrain and static feature
positions SHALL be repeatable.

#### Scenario: Realm profile controls terrain result
- **WHEN** Overground and Underground are generated from the same world
  identity
- **THEN** each result follows its own supplied profile rather than silently
  reusing the other realm's terrain or feature parameters

#### Scenario: Realm generation is repeatable
- **WHEN** the same realm profile and resolved world identity are generated
  twice with identical dimensions and parameters
- **THEN** terrain, walkability, player start, torches, and stairs match
