# minimap-world-graphics Specification

## Purpose
Lets players read the exploration minimap as a faithful, fog-aware miniature of the actual game world instead of an abstract grey coverage diagram.

## Requirements

### Requirement: Actual world graphics render beneath minimap markers

The visible exploration minimap SHALL render the eligible discovered world in three ordered passes adapted to its fixed canvas footprint and selected minimap content zoom: (1) the world background, (2) the actual world glyphs and palette visuals, and (3) start, discovered torch, and player markers. It SHALL preserve fog-of-war by omitting undiscovered content. Markers SHALL be drawn on top in their defined back-to-front order so they remain visible when occupying the same minimap cell. Existing minimap canvas dimensions, click-cycle zoom levels, persistence, and game zoom behavior SHALL remain unchanged.

#### Scenario: Discovered terrain uses game-world visuals

- **WHEN** a world area is discovered and the minimap is visible
- **THEN** the minimap SHALL show that area's terrain and object glyph visuals with their resolved game palette colors rather than a grey aggregate replacement

#### Scenario: Rendering uses the required pass order

- **WHEN** the minimap renders a discovered area containing terrain, glyphs, and markers
- **THEN** it SHALL paint the world background first, the world glyphs second, and the markers last

#### Scenario: Undiscovered terrain remains hidden

- **WHEN** a world area has not been discovered
- **THEN** the minimap SHALL not reveal its terrain or object graphics

#### Scenario: Markers overlay rendered world graphics

- **WHEN** a marker shares a minimap cell with rendered terrain or another marker
- **THEN** the marker SHALL be painted after the world graphics and lower-depth markers, with the player marker remaining the topmost marker

#### Scenario: Existing minimap interaction remains stable

- **WHEN** a player cycles minimap content zoom or refreshes the browser
- **THEN** the minimap canvas footprint SHALL remain unchanged, the selected minimap zoom SHALL persist, and the game zoom SHALL remain unchanged
