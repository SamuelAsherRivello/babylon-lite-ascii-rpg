# Spec Delta

## ADDED Requirements

### Requirement: Offset-aware glyph visual reuse

The game SHALL treat glyph offset values as part of a glyph's static visual appearance for cache reuse and invalidation. Repeated renderings with the same font, glyph identity, facing presentation, supported zoom level, and offset values SHALL be able to reuse visual data; changing a glyph's confirmed offsets SHALL cause visible glyphs using that entry to update without requiring world regeneration.

#### Scenario: Reuse unchanged offset visuals
- **WHEN** multiple visible cells use the same font, glyph identity, facing presentation, zoom level, and offset values
- **THEN** those cells SHALL be eligible to reuse the same glyph visual data

#### Scenario: Offset edit updates visible glyphs
- **WHEN** a developer confirms a new offset value for a visible glyph
- **THEN** the current rendering SHALL update affected visible cells to the new glyph position or scale
- **AND** the world data SHALL NOT be regenerated solely because of the offset edit

#### Scenario: Offset visuals across zooms
- **WHEN** a glyph with nonzero offsets is rendered at supported zoom levels
- **THEN** the glyph SHALL retain the same intended relationship to its grid cell at each supported zoom
