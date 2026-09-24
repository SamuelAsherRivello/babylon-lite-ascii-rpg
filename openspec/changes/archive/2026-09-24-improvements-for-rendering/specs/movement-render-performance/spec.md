# Spec Delta

## ADDED Requirements

### Requirement: Movement refresh work follows measured visual invalidation
The movement presentation pipeline SHALL avoid a redundant full minimap or
game-world refresh when a coalesced movement update cannot change that
surface's visible output. It SHALL preserve the final player position, fog
discovery, lighting, GPU-light presentation, minimap markers, and frame-pacing
results for the same world state and input sequence.

#### Scenario: Coalesced movement skips redundant surface work
- **WHEN** multiple movement events are coalesced before the next presentation
  opportunity and an intermediate state is superseded
- **THEN** the renderer SHALL present the newest eligible state without
  submitting a redundant full refresh for the superseded state

#### Scenario: Visible movement still refreshes required surfaces
- **WHEN** movement changes player position, discovery, lighting, or a visible
  minimap marker
- **THEN** the affected game and minimap surfaces SHALL present the newest
  state with the established visual result
