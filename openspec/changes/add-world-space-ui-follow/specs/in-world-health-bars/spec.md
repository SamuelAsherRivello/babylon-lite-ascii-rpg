# Spec Delta

## MODIFIED Requirements

### Requirement: Damageable non-player entities use transient health bars

A visible enemy or enemy spawner SHALL have a renderer-owned health bar centered above its glyph after taking damage. While the bar is active, its world-space anchor SHALL resolve from the associated entity's current rendered cell on every presentation update, so a moving enemy's bar follows it rather than remaining at its damage-time cell. The bar SHALL be approximately one grid cell wide and one quarter grid cell tall, use a small visual gap above the entity, render current health in red, render the latest lost-health delta in a lighter red, render remaining unfilled health as a dark region, and use a thin light outline consistent with the approved mockup. The overlay SHALL NOT occupy a world cell or change movement, collision, terrain, fog, or entity state.

#### Scenario: Damaged entity shows proportional health
- **WHEN** a visible enemy or spawner takes damage
- **THEN** a centered bar SHALL appear above it with red fill proportional to current health out of maximum health

#### Scenario: Active health bar follows a moving enemy
- **WHEN** a visible enemy moves to another rendered cell while its health bar remains active
- **THEN** the bar SHALL render above the enemy's current cell with its existing fill, delta segment, and visibility timing preserved

#### Scenario: Latest damage appears as a delta segment
- **WHEN** a visible enemy or spawner loses health
- **THEN** the newly lost portion SHALL appear immediately after current health in a lighter-red delta segment for `0.3` seconds before collapsing into the dark unfilled region

#### Scenario: Offscreen overlay is not rendered
- **WHEN** a damaged entity is outside the active visible region or in another realm
- **THEN** its health-bar presentation SHALL not be submitted while its gameplay state remains unchanged
