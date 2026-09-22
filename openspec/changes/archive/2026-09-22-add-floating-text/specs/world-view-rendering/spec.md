# Spec Delta

## ADDED Requirements

### Requirement: Game-view-only floating text overlay

The game world view SHALL allow a floating text overlay after world content for visible signed health-change feedback. Floating text SHALL be a game-view-only overlay and SHALL NOT become part of shared world-cell composition, minimap world rendering, minimap markers, or map-window rendering.

#### Scenario: Floating text renders above game world content
- **WHEN** a rendered entity receives a visible health delta that creates floating text
- **THEN** the game world view presents the floating text above the completed world content for that frame

#### Scenario: Shared world composition excludes floating text
- **WHEN** the minimap or map window renders through shared world-view composition
- **THEN** it does not receive or render floating text records

#### Scenario: Floating text follows rendered grid geometry
- **WHEN** the game view cell size or visible region changes while floating text is active
- **THEN** each visible floating text instance remains positioned from the rendered entity cell's current top-edge anchor and its upward motion remains proportional to the current grid-cell width
