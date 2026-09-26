# hero-sprite-animation-test Specification

## Purpose
Provides a focused visual test for replacing the player glyph with the selected animated hero while preserving the existing grid-based gameplay model.

## Requirements

### Requirement: Hero uses selected side-facing animations
The game SHALL render the selected `Hero_Warrior` art in a right-facing side pose, using idle while stationary, run while walking, attack while attacking, and death when health reaches zero.

#### Scenario: Stationary hero
- **WHEN** the living hero is not moving or attacking
- **THEN** the right-facing side idle animation is displayed

#### Scenario: Walking hero
- **WHEN** the living hero changes grid cells
- **THEN** the right-facing side run animation is displayed

#### Scenario: Attacking hero
- **WHEN** the hero performs an attack
- **THEN** the right-facing side attack animation is displayed

#### Scenario: Dead hero
- **WHEN** the hero health reaches zero
- **THEN** the right-facing side death animation plays and the hero remains visible afterward

### Requirement: Hero remains grid-compatible
The hero SHALL retain a one-cell gameplay footprint while its 32×48 visual sprite is anchored bottom-center to the occupied grid cell and may extend visually above neighboring cells.

#### Scenario: Oversized visual does not expand collision
- **WHEN** the hero sprite is rendered at the selected display scale
- **THEN** movement, occupancy, and collision continue to use the hero's single logical grid cell

### Requirement: Dead hero is non-interactive
After the death animation completes, the hero SHALL remain onscreen without movement, attack, targeting, collision, or other gameplay interaction.

#### Scenario: Corpse remains inert
- **WHEN** a dead hero's death animation has completed
- **THEN** the corpse remains visible and no gameplay system may update or interact with it
