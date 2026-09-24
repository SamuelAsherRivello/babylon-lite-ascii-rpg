# Spec Delta

## MODIFIED Requirements

### Requirement: Layered world data
The Babylon Lite game layer SHALL retain level-spawned objects, Underground civilization features, and Overworld Buildings in explicit layers associated with the terrain and character layers. Object and static-feature glyphs SHALL take visible precedence over terrain while preserving underlying natural terrain identity. Torch, Trap, Heart, and Stair objects SHALL not make their cells non-walkable; Building perimeter walls, fences, and closed doors SHALL block effective movement, while Building interiors and open doors SHALL be walkable.

#### Scenario: Walkable object occupies natural terrain
- **WHEN** a Heart, Torch, Trap, or Stair is placed in a valid generated world
- **THEN** its cell SHALL retain the underlying walkable terrain and expose the object through the object layer

#### Scenario: Object occupies a walkable terrain cell
- **WHEN** a level-spawned object is placed
- **THEN** its cell SHALL retain the underlying walkable terrain and expose the object through the object layer

#### Scenario: Barrier occupies natural terrain
- **WHEN** a fence or closed door is placed in an Underground opening
- **THEN** the underlying natural terrain SHALL remain available while the civilization layer marks the cell as blocked for movement

#### Scenario: Building wall occupies natural terrain
- **WHEN** a Building perimeter wall is placed on Overworld terrain
- **THEN** its cell SHALL retain its natural terrain identity while the Building layer marks it blocked for movement

#### Scenario: Open door preserves walkability
- **WHEN** a closed door changes to its open state
- **THEN** the open door SHALL remain rendered above the natural terrain and its cell SHALL become walkable

#### Scenario: Object is rendered above terrain
- **WHEN** an undiscovered or discovered cell contains a visible object or civilization glyph
- **THEN** the active topmost glyph SHALL render above the terrain glyph using its palette style

#### Scenario: Player occupies a walkable terrain cell
- **WHEN** the player is placed at a valid start cell
- **THEN** that cell SHALL retain its walkable terrain in the terrain layer and contain `🤺` in the character layer

#### Scenario: Water retains terrain identity under a character
- **WHEN** a character occupies a shallow-water cell
- **THEN** the visible character SHALL render while the underlying water glyph, depth, and walkability remain available in the terrain layer

#### Scenario: Torch occupies a walkable terrain cell
- **WHEN** a Torch is placed in a valid generated world
- **THEN** that cell SHALL retain its underlying walkable terrain and contain the configured Torch glyph in the object/character presentation layer
