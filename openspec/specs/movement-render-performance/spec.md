# movement-render-performance Specification

## Purpose
Defines the performance and output-stability contract for the visible game
render pipeline while the player travels rapidly through the world.

## Requirements

### Requirement: Sustained rapid movement remains responsive

During a sustained movement stress run in the supported desktop browser at the
normal game viewport, the visible game SHALL maintain a sampled frame rate of
at least `45` FPS while the player is moving with the Shift modifier at the
fastest movement cadence. Idle presentation SHALL remain at or near the
browser's available `60` FPS baseline.

#### Scenario: Shift movement meets the minimum frame rate

- **WHEN** the player holds or repeatedly uses Shift with a movement direction
  for a sustained stress run of at least ten seconds
- **THEN** every sampled one-second FPS value SHALL be `45` or higher, and the
  run SHALL not reproduce the current `41`, `30`, `26`, or `33` FPS class of
  drops

#### Scenario: Idle presentation remains stable after stress

- **WHEN** the player releases movement after the stress run and the scene
  settles
- **THEN** the displayed FPS SHALL recover to the normal approximately `60` FPS
  baseline without a render queue or stale movement work continuing to consume
  frames

### Requirement: Movement rendering preserves the established visual result

Performance improvements SHALL preserve the existing visible behavior of the
game render pipeline. Player and torch lighting factors, terrain shadow
boundaries, GPU light-pass color and falloff, fog visibility bands, discovered
minimap content, player-light refresh, and player position SHALL remain
equivalent for the same world state and inputs.

#### Scenario: Lighting and shadows remain visually equivalent

- **WHEN** the player moves through cells containing torches, blockers, and
  open terrain with the existing lighting settings
- **THEN** the rendered cells SHALL retain the same brightness, hard-shadow
  core, bounded player penumbra, torch contribution, and GPU glow appearance as
  before the optimization

#### Scenario: Fog and minimap remain visually equivalent

- **WHEN** rapid movement discovers new cells or revisits already discovered
  cells
- **THEN** persistent visibility values, hidden and visible world content,
  minimap opacity, markers, and player position presentation SHALL remain
  unchanged from the established fog behavior

### Requirement: Rapid input coalesces redundant presentation work

The movement pipeline SHALL coalesce superseded movement-driven presentation
work so that at most the necessary current visible-region lighting/render
submission and minimap update are performed for each animation-frame
opportunity. Coalescing SHALL NOT drop the final player position, retain player
light at a previous position, or leave stale GPU light sprites visible.

#### Scenario: Superseded movement does not queue stale renders

- **WHEN** multiple Shift movement events arrive before the next animation frame
- **THEN** the next presentation SHALL use the newest valid player position and
  SHALL not execute redundant obsolete full-region or minimap work for
  positions that are no longer current

#### Scenario: Player light follows the newest position

- **WHEN** rapid movement changes the player cell several times while a render
  is pending
- **THEN** the visible light field and GPU light pass SHALL represent the
  newest player cell, with no light trail at superseded cells

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
