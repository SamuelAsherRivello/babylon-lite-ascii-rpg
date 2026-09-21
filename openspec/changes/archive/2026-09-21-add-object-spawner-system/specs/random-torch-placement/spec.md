# Spec Delta

## MODIFIED Requirements

### Requirement: Generated levels use screen-relative torch density

Each accepted generated world SHALL contain persistent `🕯️` Torch objects selected toward the Object Spawner System's configured count. The initial distribution SHALL target approximately 10 to 14 Torches per 512x512 world, corresponding to approximately a 5% chance of seeing a Torch on a zoom-5 screen, while allowing a deterministic valid subset when placement constraints limit the count.

#### Scenario: Torch distribution uses the object catalog
- **WHEN** the final object-spawner pass distributes level objects
- **THEN** it SHALL use the Torch catalog entry, including the `🕯️` glyph and JSON distribution rule

#### Scenario: Screen-relative torch count
- **WHEN** the game layer generates a world with a visible grid and the configured zoom-5 density target
- **THEN** the requested Torch count SHALL target the catalog's approximately 10–14-per-world range for the 512x512 world

#### Scenario: Small-world minimum
- **WHEN** a generated world has fewer valid spaced Torch positions than requested
- **THEN** the object layer SHALL contain a deterministic valid subset and no selected Torches SHALL violate the minimum-distance rule

### Requirement: Torch positions are valid wall-adjacent floor cells

Each Torch SHALL occupy a walkable cell that is orthogonally adjacent to at least one non-walkable wall cell, shall not occupy the player start, and shall satisfy the configured minimum separation from other Torches.

#### Scenario: Valid torch placement
- **WHEN** Torch positions are inspected
- **THEN** every Torch SHALL be walkable, distinct from the player start, wall-adjacent, and separated according to the catalog rule

#### Scenario: Torch minimum spacing
- **WHEN** a generated world contains two or more Torches
- **THEN** every distinct pair of selected Torches SHALL satisfy the configured minimum Euclidean grid distance

### Requirement: Torch placement is seed-deterministic

Torch placement SHALL use the resolved world seed and SHALL remain stable across rendering, resizing, zoom changes, and palette changes.

#### Scenario: Re-render does not move torches
- **WHEN** the viewport, zoom, or palette changes
- **THEN** Torch positions and lighting-source positions SHALL remain unchanged

#### Scenario: Repeated seeded generation
- **WHEN** two worlds use identical dimensions, generation options, and seed
- **THEN** their Torch count, positions, and derived lighting source inputs SHALL be identical

#### Scenario: Different level identity
- **WHEN** worlds have different resolved seeds or different accepted terrain layouts
- **THEN** Torch placement SHALL be allowed to differ while each generated world remains a valid lighting-source set

### Requirement: Torches are non-blocking characters

Torch objects SHALL preserve the walkability of their underlying terrain, SHALL not be pickups, and SHALL not disappear or emit object logs when the player enters their cells.

#### Scenario: Movement through a torch cell
- **WHEN** the player enters a walkable Torch cell
- **THEN** movement SHALL succeed and the Torch SHALL remain present and non-interactable

## ADDED Requirements

### Requirement: Paired stairs use object-spawner distribution

The paired Stairs object distribution SHALL use the Object Spawner System's configured level-spawn rule and SHALL select coordinates valid in both realms.

#### Scenario: Invalid shared coordinate is rejected
- **WHEN** a candidate Stair coordinate is blocked, occupied incompatibly, or unreachable in either realm
- **THEN** the candidate SHALL be rejected without rewriting terrain or walkability
