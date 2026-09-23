# minimap-rendering Specification

## Purpose

Provides an aspect-correct, player-centered minimap that represents world cells without geometric distortion across presentation modes.

## Requirements

### Requirement: Aspect-correct minimap composition
The minimap MUST preserve the world's cell aspect ratio and spatial proportions regardless of whether the game is rendered in landscape or portrait presentation. The minimap canvas bounds MUST remain unchanged, and unused space MUST be handled with centered letterboxing or a uniformly scaled crop rather than independently stretching horizontal and vertical cells.

#### Scenario: Landscape world view
- **WHEN** the game uses a landscape viewport
- **THEN** the minimap shows the same world composition with uniform cell proportions and no horizontal or vertical stretching

#### Scenario: Portrait world view
- **WHEN** the game uses a portrait viewport or a world region with a different aspect ratio
- **THEN** the minimap preserves square/world-cell proportions, centers the composition, and uses only uniform scaling or letterboxing

#### Scenario: Minimap zoom levels
- **WHEN** the player cycles minimap zoom through 1, 2, and 3
- **THEN** the minimap uses 4, 8, and 16 CSS-pixel cell footprints respectively, showing approximately 80, 40, and 20 cells per side in a 320 CSS-pixel panel without changing the minimap canvas size or distorting cell proportions
