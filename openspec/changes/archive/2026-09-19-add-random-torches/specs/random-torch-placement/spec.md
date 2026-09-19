# Spec Delta

## Purpose

Provides deterministic, non-interactive torch landmarks in generated ASCII
levels so later lighting systems can use stable torch positions.

## ADDED Requirements

### Requirement: Generated levels use screen-relative torch density

Each accepted generated world SHALL contain lowercase `T` torch characters
selected using a requested torch count. The game layer SHALL request a count
that targets approximately three torches per visible screen at zoom 5. Small
test worlds SHALL contain at least three torches when three valid candidates
exist.

#### Scenario: Screen-relative torch count

- **WHEN** the game layer generates a world with a visible grid and the
  default zoom of 5
- **THEN** the requested torch count SHALL be approximately three times the
  ratio of world cell area to visible screen cell area

#### Scenario: Small-world minimum

- **WHEN** a test-sized world has at least three valid torch candidates
- **THEN** its character layer SHALL contain at least three `T` values

### Requirement: Torch positions are valid wall-adjacent floor cells

Each torch SHALL occupy a walkable cell that is orthogonally adjacent to at
least one non-walkable wall cell. A torch SHALL NOT occupy the player start
cell or the same cell as another torch.

#### Scenario: Valid torch placement

- **WHEN** torch positions are inspected in a generated world
- **THEN** every torch position SHALL be walkable, distinct from the player
  start, and adjacent by cardinal direction to at least one wall

### Requirement: Torch placement is seed-deterministic

Torch placement SHALL use the world's resolved generation seed and SHALL be
repeatable when the same world dimensions and generation options are reused.

#### Scenario: Repeated seeded generation

- **WHEN** two worlds are generated with identical dimensions, generation
  options, and seed
- **THEN** their torch count and positions SHALL be identical

#### Scenario: Different level identity

- **WHEN** worlds have different resolved seeds or different accepted terrain
  layouts
- **THEN** torch placement SHALL be allowed to differ

### Requirement: Torches are non-blocking characters

Torch characters SHALL preserve the walkability of their underlying terrain
and SHALL not prevent the player from entering or leaving their cells.

#### Scenario: Movement through a torch cell

- **WHEN** the player attempts to move into a torch cell whose terrain is
  walkable
- **THEN** the move SHALL be evaluated as walkable terrain, subject only to
  the existing player-character occupancy rules
