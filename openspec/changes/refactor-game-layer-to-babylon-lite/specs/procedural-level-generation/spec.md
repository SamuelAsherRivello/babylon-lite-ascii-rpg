# Spec Delta

## MODIFIED Requirements

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

The generated terrain SHALL use `W` for non-walkable walls and `•` for
walkable empty cells. The outermost row and column SHALL be walls, and the
selected playable region SHALL be connected and meet the configured minimum
walkable-area requirement.

#### Scenario: Outer border is non-walkable

- **WHEN** a world is generated
- **THEN** every cell in the outermost row and column SHALL be `W` and have
  `walkable: false`

#### Scenario: Player region is connected

- **WHEN** a generated world is accepted
- **THEN** its playable region SHALL consist of one connected walkable area
  large enough to contain the player start cell

### Requirement: Layered world data

The Babylon Lite game layer SHALL own a world with a terrain layer and a
character layer. Terrain cells SHALL be present for every world position,
while character cells MAY be empty or contain `P`.

#### Scenario: Player occupies a walkable terrain cell

- **WHEN** the player is placed at a valid start cell
- **THEN** that cell SHALL retain its walkable terrain in the terrain layer and
  contain `P` in the character layer

### Requirement: Top-most cell rendering

The Babylon Lite game layer SHALL render at most one visible glyph for each
cell. A character glyph SHALL take precedence over the terrain glyph at the
same position, and the visible glyph SHALL use the active palette style when
rendered.

#### Scenario: Character hides terrain

- **WHEN** a cell contains terrain `•` and character `P`
- **THEN** the rendered cell SHALL show only `P`

#### Scenario: Empty character layer shows terrain

- **WHEN** a cell has terrain `W` or `•` and no character
- **THEN** the rendered cell SHALL show that terrain glyph
