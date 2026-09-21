# Spec Delta

## MODIFIED Requirements

### Requirement: Camera Lock wrap behavior

`Camera Lock` SHALL keep the viewport origin fixed during ordinary movement. If
the player moves one step beyond a visible screen edge into a valid wrapped
position, the game SHALL shift the visible world and place the player at the
opposite screen edge in the corresponding direction. The resulting viewport
render SHALL reconcile every screen cell, including cells that are not
discovered, so no glyph from the previous viewport composition remains visible.

#### Scenario: Wrap upward

- **WHEN** the player moves one step beyond the top visible row in `Camera Lock`
- **THEN** the player SHALL appear entering through the bottom visible row, the
  visible world SHALL shift consistently with that wrap, and no stale glyph
  SHALL remain in a screen cell whose world content is undiscovered

#### Scenario: Wrap downward

- **WHEN** the player moves one step beyond the bottom visible row in `Camera Lock`
- **THEN** the player SHALL appear entering through the top visible row and no
  stale glyph SHALL remain in a screen cell whose world content is undiscovered

#### Scenario: Wrap horizontally

- **WHEN** the player moves one step beyond the left or right visible column in
  `Camera Lock`
- **THEN** the player SHALL appear entering through the opposite horizontal edge
  and no stale glyph SHALL remain in a screen cell whose world content is
  undiscovered

#### Scenario: Lock mode at a non-wrappable world boundary

- **WHEN** a wrap target is outside the generated world or is not walkable
- **THEN** the player SHALL remain on its current world cell and world time
  SHALL not advance
