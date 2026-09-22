# Spec Delta

## ADDED Requirements

### Requirement: Shared glyph offset presentation

The world-view renderer SHALL apply the confirmed per-glyph offset values whenever it renders a glyph in the game view or mini-map. Offsets SHALL affect only presentation within the destination cell; they SHALL NOT change world coordinates, collision, fog eligibility, actor occupancy, pickup collection, or authoritative glyph identity.

#### Scenario: Game view applies glyph offsets
- **WHEN** a discovered game-view cell renders a glyph with confirmed offset values
- **THEN** the glyph SHALL appear shifted and scaled within its grid cell according to those values
- **AND** the cell's world position and gameplay occupancy SHALL remain unchanged

#### Scenario: Mini-map applies glyph offsets
- **WHEN** the mini-map renders a discovered glyph with confirmed offset values
- **THEN** the mini-map SHALL apply the same offset semantics adapted to its destination cell scale
- **AND** the mini-map SHALL preserve the same fog, lighting, and overlay ordering as other world-view content

#### Scenario: Ascii previews share client cell rendering
- **WHEN** the Ascii Settings palette grid or glyph editor preview renders a glyph
- **THEN** it SHALL use the same composite cell rendering technology as the game view and mini-map for the glyph background, glyph pixels, offsets, and fully visible lighting treatment

#### Scenario: Facing and offsets combine
- **WHEN** the player or an enemy renders with a left- or right-facing presentation
- **THEN** the renderer SHALL apply the actor's facing presentation and the base glyph's confirmed offsets together
- **AND** palette lookup SHALL remain tied to the base glyph identity
