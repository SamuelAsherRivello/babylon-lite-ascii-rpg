# Spec Delta

## ADDED Requirements

### Requirement: Game-owned exploration and minimap rendering

Babylon Lite SHALL own fog-of-war state, discovery evaluation, minimap fog
opacity calculation, and unlit world-content minimap rendering. React SHALL own only the
persisted `Minimap` control and SHALL send its Boolean visibility value through
the narrow bridge; it SHALL NOT receive or render mutable world cells,
discovery data, or minimap cells.

#### Scenario: Visibility command stays narrow

- **WHEN** the user changes the `Minimap` setting in React
- **THEN** React sends only the visibility value and Babylon Lite updates
  minimap presentation without transferring world or fog data to React

#### Scenario: Game layer retains fog authority

- **WHEN** the player moves or a world is generated
- **THEN** Babylon Lite updates discovery and fog-masked minimap content
  without React owning the world state or performing per-cell rendering
