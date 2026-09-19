# Spec Delta

## MODIFIED Requirements

### Requirement: Grid-aligned player rendering

The game SHALL render one player glyph as the letter `P`. The glyph SHALL use
one grid cell at the default font resolution of `1.0`, its visual center SHALL
align with the center of the player's current logical grid cell, and its color
and alpha SHALL be resolved from the ASCII palette.

#### Scenario: Initial player placement

- **WHEN** a new game view is shown
- **THEN** a `P` SHALL be visible in the center grid cell of the logical
  viewport and SHALL use the palette style for `P`

#### Scenario: Player cell movement

- **WHEN** the player moves by one cardinal or diagonal step
- **THEN** the `P` SHALL render in the destination grid cell with its center
  aligned to that cell's center and its palette style unchanged
