# Spec Delta

## ADDED Requirements

### Requirement: Walkable Overworld grass-art presentation test
The world-view composition SHALL support a selected walkable Overworld ground
presentation that draws the supplied grass artwork while preserving the
terrain cell's authoritative glyph identity, walkability, collision, fog
eligibility, lighting semantics, and deterministic generated position.

#### Scenario: Grass artwork preserves a walkable terrain cell
- **WHEN** the selected walkable Overworld ground presentation is rendered in
  a visible cell
- **THEN** it draws the grass artwork and the underlying terrain remains
  walkable ground with unchanged gameplay and world-generation behavior

#### Scenario: Shared views retain authoritative behavior
- **WHEN** the selected grass-art ground cell is rendered by the game view,
  mini-map, or mapview
- **THEN** each view applies its established source bounds, fog, lighting,
  opacity, and overlay ordering without changing terrain identity
