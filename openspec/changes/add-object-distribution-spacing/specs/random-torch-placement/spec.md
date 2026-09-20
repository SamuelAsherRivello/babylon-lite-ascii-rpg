# Spec Delta

## MODIFIED Requirements

### Requirement: Generated levels use screen-relative torch density

Each accepted generated world SHALL contain lowercase `T` torch characters
selected toward a requested torch count. The game layer SHALL request a count
that targets approximately three torches per visible screen at zoom 5. The
generator SHALL return every selected torch only when it can meet all torch
placement constraints, including the 25-grid minimum distance; when fewer
valid spaced positions are selected than requested, it SHALL return the
deterministic valid subset from its distribution order.

#### Scenario: Screen-relative torch count

- **WHEN** the game layer generates a world with a visible grid and the
  default zoom of 5
- **THEN** the requested torch count SHALL be approximately three times the
  ratio of world cell area to visible screen cell area

#### Scenario: Small-world minimum

- **WHEN** a generated world has fewer valid 25-grid-spaced torch positions
  than its requested torch count, including a test-sized world with at least
  three otherwise valid torch candidates
- **THEN** the character layer SHALL contain a deterministic valid spaced
  subset and no selected torches SHALL violate the minimum-distance rule

### Requirement: Torch positions are valid wall-adjacent floor cells

Each torch SHALL occupy a walkable cell that is orthogonally adjacent to at
least one non-walkable wall cell. A torch SHALL NOT occupy the player start
cell or the same cell as another torch. Every pair of selected torches SHALL
be separated by at least 25 Euclidean grid cells, measured between their cell
centers.

#### Scenario: Valid torch placement

- **WHEN** torch positions are inspected in a generated world
- **THEN** every torch position SHALL be walkable, distinct from the player
  start, and adjacent by cardinal direction to at least one wall

#### Scenario: Torch minimum spacing

- **WHEN** a generated world contains two or more torches
- **THEN** every distinct pair of torch positions SHALL have a Euclidean
  cell-center distance of at least 25 grid cells
