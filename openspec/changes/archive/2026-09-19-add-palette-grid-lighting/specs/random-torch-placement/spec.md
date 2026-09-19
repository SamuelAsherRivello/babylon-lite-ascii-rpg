# Spec Delta

## MODIFIED Requirements

### Requirement: Torch placement is seed-deterministic

Torch placement SHALL use the world's resolved generation seed and SHALL be
repeatable when the same world dimensions and generation options are reused.
The resulting torch row/column positions SHALL remain stable inputs for the
palette/grid lighting pass and SHALL not be randomized again during rendering.

#### Scenario: Repeated seeded generation

- **WHEN** two worlds are generated with identical dimensions, generation
  options, and seed
- **THEN** their torch count, positions, and derived lighting source inputs
  SHALL be identical

#### Scenario: Different level identity

- **WHEN** worlds have different resolved seeds or different accepted terrain
  layouts
- **THEN** torch placement SHALL be allowed to differ while each generated
  world remains a valid lighting-source set

#### Scenario: Re-render does not move torches

- **WHEN** the viewport resizes, zoom changes, or the palette changes
- **THEN** torch positions SHALL remain unchanged while visible lighting is
  recalculated from those same positions
