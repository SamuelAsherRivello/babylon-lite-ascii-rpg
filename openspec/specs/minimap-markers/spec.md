# minimap-markers Specification

## Purpose

Provides an explicit minimap-marker layer that keeps exploration landmarks legible without exposing fogged world content.

## Requirements

### Requirement: Fog-independent origin and player markers
The minimap SHALL render a green dot at the generated world's original player-start cell and a yellow dot at the player's current cell. Both markers SHALL render regardless of whether their cells have been discovered or their coarse minimap areas have any fog coverage. When the markers map to the same minimap dot, the yellow player dot SHALL be rendered on top and be the visible color.

#### Scenario: Initial player position
- **WHEN** a new world has initialized its fog state and the player remains at the original start cell
- **THEN** the minimap shows a yellow dot at that location, with the green origin marker drawn beneath it

#### Scenario: Player leaves origin through fogged terrain
- **WHEN** the player has moved away from the original start cell and either the start or current coarse minimap area is otherwise fully fogged
- **THEN** the minimap still shows the green origin dot and the yellow current-player dot at their respective mapped locations

### Requirement: Discovery-gated torch markers
The minimap SHALL render a white dot for each generated torch only when that torch's exact world cell is discovered. A torch in a partly revealed coarse minimap area SHALL remain unmarked until its own cell is discovered. A torch marker SHALL appear on the next minimap render after its cell becomes discovered and SHALL remain visible while that world and minimap are active.

#### Scenario: Undiscovered torch in a partly revealed minimap area
- **WHEN** another walkable cell in a torch's coarse minimap area is discovered but the torch cell itself is not
- **THEN** the minimap SHALL not render a white marker for that torch

#### Scenario: Discover a torch cell
- **WHEN** a torch's world cell becomes discovered
- **THEN** the minimap SHALL render a white dot at that torch's mapped minimap location

### Requirement: Marker composition preserves minimap fog behavior
The minimap SHALL compose its layers in the following back-to-front depths: black base at 0, fog-masked world content at 10, green start marker at 20, discovered white torch markers at 30, and yellow player marker at 40. Marker colors SHALL be solid green, white, or yellow rather than reduced by the world-content fog opacity. A yellow player marker SHALL be visible over a white torch marker when the player occupies a torch cell. The marker layer SHALL not reveal additional terrain, modify discovery, change generated world data, or alter minimap visibility behavior.

#### Scenario: Render fogged terrain with markers
- **WHEN** a minimap render includes fully fogged terrain and fog-independent markers
- **THEN** the terrain remains black and hidden while the applicable green and yellow dots remain visible

#### Scenario: Player occupies a discovered torch cell
- **WHEN** the player occupies a torch cell whose marker is eligible to render
- **THEN** the yellow player dot is visible at depth 40 above the white torch dot at depth 30
