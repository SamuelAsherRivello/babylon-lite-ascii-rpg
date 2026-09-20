# Spec Delta

## ADDED Requirements

### Requirement: Game-owned exploration and minimap rendering

Babylon Lite SHALL own fog-of-war state, discovery evaluation, minimap fog
opacity calculation, and unlit world-content minimap rendering. React SHALL
NOT own a minimap visibility control or send visibility through the bridge;
it SHALL NOT receive or render mutable world cells,
discovery data, or minimap cells.

#### Scenario: Minimap presentation stays game-owned

- **WHEN** a world is generated or updated
- **THEN** Babylon Lite keeps the minimap rendered without a visibility
  command or React-owned world and fog data

#### Scenario: Game layer retains fog authority

- **WHEN** the player moves or a world is generated
- **THEN** Babylon Lite updates discovery and fog-masked minimap content
  without React owning the world state or performing per-cell rendering
