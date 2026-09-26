# Spec Delta

## MODIFIED Requirements

### Requirement: Generated levels use screen-relative torch density

Each accepted generated world SHALL contain persistent `🕯️` Torch objects
selected toward the Object Spawner System's configured count. The initial
distribution SHALL target approximately 10 to 14 Torches per 512x512 world,
corresponding to approximately a 5% chance of seeing a Torch on a zoom-5
screen, while allowing a deterministic valid subset when placement constraints
limit the count. The catalog glyph SHALL remain the authoritative Torch
identity; eligible main-game-view rendering MAY present that identity with the
animated raster artwork defined by `animated-torch-presentation`.

#### Scenario: Torch distribution uses the object catalog
- **WHEN** the final object-spawner pass distributes level objects
- **THEN** it SHALL use the Torch catalog entry, including the `🕯️` glyph and
  JSON distribution rule, while eligible main-game-view presentation may use
  the animated Torch artwork

#### Scenario: Screen-relative torch count
- **WHEN** the game layer generates a world with a visible grid and the
  configured zoom-5 density target
- **THEN** the requested Torch count SHALL target the catalog's approximately
  10-14-per-world range for the 512x512 world

#### Scenario: Small-world minimum
- **WHEN** a generated world has fewer valid spaced Torch positions than requested
- **THEN** the object layer SHALL contain a deterministic valid subset and no
  selected Torches SHALL violate the minimum-distance rule
