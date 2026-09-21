# minimap-markers Specification

## Purpose

Provides an explicit minimap-marker layer that keeps exploration landmarks legible without exposing fogged world content.

## Requirements

### Requirement: Fog-independent origin and player markers
The minimap SHALL render a green dot at the generated world's original player-start cell only when that exact world gridspot is discovered/unfogged. The minimap SHALL render a yellow dot at the player's current cell only when that exact world gridspot is discovered/unfogged. When both eligible markers map to the same minimap dot, the yellow player dot SHALL be rendered on top and be the visible color.

#### Scenario: Initial player position
- **WHEN** a new world initializes and the player's current start gridspot is discovered
- **THEN** the minimap shows a yellow dot at that mapped location, with the eligible green origin marker beneath it

#### Scenario: Origin or player gridspot is fogged
- **WHEN** the origin or current player gridspot has not been discovered
- **THEN** the corresponding minimap marker is not rendered, even if another gridspot in the same coarse minimap area is discovered

#### Scenario: Player leaves origin through fogged terrain
- **WHEN** the player moves to a gridspot that remains fogged
- **THEN** the minimap does not show the yellow current-player dot until that exact gridspot becomes discovered

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
- **THEN** the minimap SHALL render a white dot at that torch's mapped minimap location

### Requirement: Marker composition preserves minimap fog behavior
The minimap SHALL compose its layers in the following back-to-front depths: black base at 0, fog-masked world content at 10, eligible green start marker at 20, discovered white torch markers at 30, and eligible yellow player marker at 40. Marker colors SHALL be solid green, white, or yellow rather than reduced by the world-content fog opacity. A yellow player marker SHALL be visible over a white torch marker when the player occupies a discovered torch cell. The marker layer SHALL not reveal additional terrain, modify discovery, change generated world data, or alter minimap visibility behavior.

#### Scenario: Render fogged terrain with markers
- **WHEN** a minimap render includes fully fogged terrain and no marker gridspot is discovered
- **THEN** the terrain and all markers remain hidden

#### Scenario: Player occupies a discovered torch cell
- **WHEN** the player occupies a discovered torch cell with a discovered torch
- **THEN** the yellow player dot is visible at depth 40 above the white torch dot at depth 30

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

### Requirement: Minimap consumes quest-owned marker state

Babylon Lite SHALL derive minimap object markers from active quest-owned object identities in the Object Spawner System's current state. Object type or `IsPickup` status alone SHALL not make an object eligible for a marker. React SHALL not receive object coordinates or mutable object collections.

#### Scenario: Active pickup is marked
- **WHEN** an active quest pickup is inside or outside the minimap viewport
- **THEN** the existing pickup marker behavior SHALL use the pickup's centralized object identity and position

#### Scenario: Non-quest objects are not marked
- **WHEN** an active Heart, Trap, Torch, or Stairs object exists in the active realm
- **THEN** it SHALL not produce a minimap quest marker or edge indicator
