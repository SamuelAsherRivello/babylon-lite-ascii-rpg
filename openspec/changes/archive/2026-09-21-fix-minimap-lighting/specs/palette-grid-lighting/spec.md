# Spec Delta

## MODIFIED Requirements

### Requirement: Palette-based visible rendering

The renderer SHALL apply the cell lighting factor to the active palette style
when submitting a visible glyph. When Glyph Background is enabled, the
renderer SHALL first derive and compose the opaque background from that same
palette color using Background Darkness, then SHALL apply the lighting factor
once to the combined background-and-glyph result in both game and mini-map
views. The mini-map SHALL apply this factor to its base glyph color before any
optional GPU light-pass overlay. When the GPU light pass is enabled, the
mini-map SHALL use the same cached torch/player light samples and additive
light color as the game view, without treating that overlay as a replacement
for base glyph lighting. Lighting SHALL affect rendered color and opacity
together; it SHALL not rewrite terrain cells, character cells, palette
entries, or the glyph atlas. A torch glyph SHALL remain visible as a character
layer glyph while its surrounding cells receive the derived lighting.

#### Scenario: Unlit palette style uses ambient lighting

- **WHEN** a visible glyph has no unobstructed torch or player contribution
- **THEN** its submitted style SHALL be the active palette style modulated by
  the ambient factor in both the game view and mini-map view

#### Scenario: Lit palette style is transient

- **WHEN** a cell is rendered inside an unobstructed source field
- **THEN** the submitted style SHALL be brighter than its ambient-only style
  without changing the saved palette or terrain data in either view

#### Scenario: Background preserves relative darkness

- **WHEN** a cell is rendered with Background Darkness `50`
- **THEN** lighting SHALL brighten or dim the glyph and background together
  while preserving the background's darker relationship to the glyph in both
  views

#### Scenario: Minimap GPU overlay does not replace base lighting

- **WHEN** the optional GPU light pass is enabled for a discovered mini-map
  cell
- **THEN** the mini-map SHALL render that cell from its lighting-modulated
  base palette color and SHALL add only the shared visual light composite on
  top, without rendering a full-bright base color first
