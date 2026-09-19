# Spec Delta

## MODIFIED Requirements

### Requirement: Layered world data

The Babylon Lite game layer SHALL own a world with explicit terrain layers and
a character layer. Terrain cells SHALL be present for every world position and
SHALL retain their source kind, glyph, depth where applicable, walkability,
color, and alpha. Character cells MAY be empty or contain `P` or other
character-layer glyphs such as `T`; characters SHALL NOT rewrite terrain data.

#### Scenario: Player occupies a walkable terrain cell

- **WHEN** the player is placed at a valid start cell
- **THEN** that cell SHALL retain its walkable terrain in the terrain layer and
  contain `P` in the character layer

#### Scenario: Water retains terrain identity under a character

- **WHEN** a character occupies a shallow-water cell
- **THEN** the visible character SHALL be rendered while the underlying water
  glyph, depth, and walkability remain available in the terrain layer

#### Scenario: Torch occupies a walkable terrain cell

- **WHEN** a torch is placed in a valid generated world
- **THEN** that cell SHALL retain its underlying walkable terrain and contain
  `T` in the character layer

### Requirement: Top-most cell rendering

The Babylon Lite game layer SHALL render at most one visible glyph for each
cell. A character glyph SHALL take precedence over the terrain glyph at the
same position, and the visible glyph SHALL use the active palette style when
rendered. Empty character cells SHALL render the terrain glyph and its active
style. When both a player and a torch would otherwise target the same
position, the player glyph SHALL remain the visible character.

#### Scenario: Character hides terrain

- **WHEN** a cell contains terrain `•`, `~`, `≈`, or `▓` and a character
- **THEN** the rendered cell SHALL show only the character glyph

#### Scenario: Torch hides terrain

- **WHEN** a cell contains terrain `•` or `W` and character `T`
- **THEN** the rendered cell SHALL show only `T`

#### Scenario: Empty character layer shows terrain

- **WHEN** a cell has terrain `W`, `•`, `~`, `≈`, or `▓` and no character
- **THEN** the rendered cell SHALL show the terrain glyph with its configured
  style
