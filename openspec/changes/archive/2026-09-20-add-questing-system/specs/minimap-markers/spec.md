# Spec Delta

## MODIFIED Requirements

### Requirement: Fog-independent origin and player markers

The minimap SHALL render a green dot at the generated world's original player-start cell and a yellow dot at the player's current cell. Both markers SHALL render regardless of whether their cells have been discovered or their coarse minimap areas have any fog coverage. The minimap SHALL also render every active quest pickup marker regardless of fog discovery. When markers map to the same minimap dot, the marker with the greater depth SHALL be rendered on top.

#### Scenario: Initial player position
- **WHEN** a new world has initialized its fog state and the player remains at the original start cell
- **THEN** the minimap shows a yellow dot at that location, with the green origin marker drawn beneath it

#### Scenario: Player leaves origin through fogged terrain
- **WHEN** the player has moved away from the original start cell and either the start or current coarse minimap area is otherwise fully fogged
- **THEN** the minimap still shows the green origin dot and the yellow current-player dot at their respective mapped locations

#### Scenario: Quest pickup is outside discovered terrain
- **WHEN** an active quest pickup is in an undiscovered cell or coarse minimap area
- **THEN** its quest marker SHALL remain visible without revealing the underlying terrain

### Requirement: Discovery-gated torch markers

The minimap SHALL render a white dot for each generated torch only when that torch's exact world cell is discovered. A torch in a partly revealed coarse minimap area SHALL remain unmarked until its own cell is discovered. A torch marker SHALL appear on the next minimap render after its cell becomes discovered and SHALL remain visible while that world and minimap are active.

#### Scenario: Undiscovered torch in a partly revealed minimap area
- **WHEN** another walkable cell in a torch's coarse minimap area is discovered but the torch cell itself is not
- **THEN** the minimap SHALL not render a white marker for that torch

#### Scenario: Discover a torch cell
- **WHEN** a torch's world cell becomes discovered
- **THEN** the minimap SHALL render a white marker at that torch's mapped minimap location

### Requirement: Marker composition preserves minimap fog behavior

The minimap SHALL compose its layers in the following back-to-front depths: black base at 0, fog-masked world content at 10, green start marker at 20, active quest pickup markers at 30, discovered white torch markers at 35, and yellow player marker at 40. Quest pickup markers SHALL be solid yellow squares or equivalent solid yellow marker pixels. Quest markers SHALL not reveal terrain, modify discovery, change generated world data, or alter minimap visibility behavior. A quest pickup outside the minimap viewport SHALL render a clear yellow directional chevron on the minimap edge pointing toward its world position. A yellow player marker SHALL be visible over other markers when the player occupies the same cell.

#### Scenario: Render fogged terrain with markers
- **WHEN** a minimap render includes fully fogged terrain and fog-independent markers
- **THEN** the terrain remains black and hidden while the applicable green, yellow quest, and yellow player markers remain visible

#### Scenario: Quest pickup is inside the viewport
- **WHEN** an active quest pickup lies inside the minimap viewport
- **THEN** the minimap SHALL render a solid yellow square at its mapped cell

#### Scenario: Quest pickup is outside the viewport
- **WHEN** an active quest pickup lies outside the minimap viewport
- **THEN** the minimap SHALL render a yellow edge indicator on the minimap boundary in the pickup's direction

#### Scenario: Multiple quest pickups are off-screen
- **WHEN** multiple active quest pickups project to the same minimap edge region
- **THEN** the minimap SHALL keep each yellow directional chevron distinguishable

#### Scenario: Player occupies a marked cell
- **WHEN** the player occupies a quest pickup or discovered torch cell
- **THEN** the yellow player dot SHALL be visible above the other marker

#### Scenario: Player occupies a discovered torch cell
- **WHEN** the player occupies a torch cell whose marker is eligible to render
- **THEN** the yellow player dot is visible at depth 40 above the white torch dot
