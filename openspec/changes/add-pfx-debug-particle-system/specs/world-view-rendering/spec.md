# Spec Delta

## ADDED Requirements

### Requirement: Particle overlay pass
The world-view composition SHALL support an optional particle overlay pass after world content and before any view-specific overlays that are explicitly configured above particles.

#### Scenario: Particle renders above a tile
- **WHEN** a visible cell has an active particle effect
- **THEN** the world tile and glyph render first and the transparent particle renders above them without changing the cell's authoritative content

#### Scenario: Particle pass is optional
- **WHEN** a view does not enable particle overlays
- **THEN** its existing world composition remains unchanged and no particle sprites are submitted
