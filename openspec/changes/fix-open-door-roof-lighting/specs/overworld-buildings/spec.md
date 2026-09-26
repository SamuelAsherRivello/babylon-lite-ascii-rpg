# Spec Delta

## MODIFIED Requirements

### Requirement: Reusable Overworld Building model

The Overworld SHALL support deterministic, multi-cell Buildings that preserve
their underlying natural terrain identity while owning an exterior overlay, an
interior overlay, and one Door entrance. A Building's walls SHALL block entry
from every exterior edge other than its Door; its interior cells SHALL be
effectively walkable. Its exterior overlay SHALL remain visible while the
player is outside that Building, and its interior overlay SHALL be visible
while the player occupies its Door cell or any interior cell. Leaving the Door
cell for an exterior cell SHALL restore that Building's exterior overlay. While
the exterior overlay conceals interior cells, its roof-cover cells SHALL not
visually receive source lighting or GPU light presentation; opening the Door
SHALL continue to permit normal grid-light transport into the interior.

#### Scenario: Exterior conceals a Building interior

- **WHEN** a player is outside a generated Building
- **THEN** the Building renders its exterior overlay and its interior cells
  remain inaccessible except through its Door

#### Scenario: Entered Building reveals its interior

- **WHEN** a player enters an unlocked Building Door or walks inside that
  Building
- **THEN** its exterior interior-cover cells render as the Building's interior
  overlay and every interior cell remains walkable

#### Scenario: Exit restores the exterior

- **WHEN** a player moves from a Building Door cell to an exterior cell
- **THEN** that Building's exterior interior-cover cells render again

#### Scenario: Open Door preserves a dark roof presentation

- **WHEN** a Building Door is open and a source can reach concealed interior
  cells through that Door while the player remains outside the Building
- **THEN** the exterior roof-cover cells SHALL not visibly brighten from that
  source or receive GPU light presentation, while the Door continues to
  transmit grid light
