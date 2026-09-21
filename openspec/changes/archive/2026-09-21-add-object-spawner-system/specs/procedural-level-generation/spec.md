# Spec Delta

## MODIFIED Requirements

### Requirement: Layered world data

The Babylon Lite game layer SHALL retain level-spawned objects in an explicit object layer associated with the terrain and character layers. Object glyphs SHALL take visible precedence over terrain while preserving underlying walkability. Torch, Trap, Heart, and Stair objects SHALL not make their cells non-walkable.

#### Scenario: Object occupies a walkable terrain cell
- **WHEN** a level-spawned object is placed
- **THEN** its cell SHALL retain the underlying walkable terrain and expose the object through the object layer

#### Scenario: Object is rendered above terrain
- **WHEN** an undiscovered or discovered cell contains a visible object
- **THEN** the active object glyph SHALL be rendered above the terrain glyph using its palette style

#### Scenario: Player occupies a walkable terrain cell
- **WHEN** the player is placed at a valid start cell
- **THEN** that cell SHALL retain its walkable terrain in the terrain layer and contain `P` in the character layer

#### Scenario: Water retains terrain identity under a character
- **WHEN** a character occupies a shallow-water cell
- **THEN** the visible character SHALL be rendered while the underlying water glyph, depth, and walkability remain available in the terrain layer

#### Scenario: Torch occupies a walkable terrain cell
- **WHEN** a Torch is placed in a valid generated world
- **THEN** that cell SHALL retain its underlying walkable terrain and contain the configured Torch glyph in the object/character presentation layer

### Requirement: Deterministic realm profile generation

Given the same world identity, dimensions, realm profile, object catalog, and generation parameters, a realm's terrain, player start, paired Stairs, and level-spawned object positions SHALL be repeatable.

#### Scenario: Realm object generation is repeatable
- **WHEN** the same realm inputs are generated twice
- **THEN** Hearts, Torches, Traps, and paired Stairs SHALL have identical types and positions

#### Scenario: Realm profile controls terrain result
- **WHEN** Overground and Underground are generated from the same world identity
- **THEN** each result SHALL follow its own supplied profile rather than silently reusing the other realm's terrain or feature parameters

#### Scenario: Realm generation is repeatable
- **WHEN** the same realm profile and resolved world identity are generated twice with identical dimensions and parameters
- **THEN** terrain, walkability, player start, Torches, and Stairs SHALL match
