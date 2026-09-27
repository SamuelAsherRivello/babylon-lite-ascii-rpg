# Spec Delta

## Purpose

Defines one reusable presentation contract for static and animated PNG tiles so
the game can consistently render any supported asset without changing gameplay.

## ADDED Requirements

### Requirement: Static tile presentation is reusable
The game SHALL represent a static tile as one qualified PNG source image and one source rectangle. A renderer that supports the source geometry SHALL be able to render that tile at a supplied presentation anchor and size without changing the owning world's coordinates, occupancy, collision, fog eligibility, gameplay time, or object state.

#### Scenario: Static PNG tile is rendered
- **WHEN** a renderer receives a valid static tile and an eligible presentation record
- **THEN** it renders the declared source rectangle at that record's presentation anchor and leaves gameplay state unchanged

#### Scenario: Unsupported static tile does not alter gameplay
- **WHEN** a renderer cannot load or support a declared static tile asset
- **THEN** it omits only that presentation and preserves the owning gameplay record and world state

### Requirement: Animated tile has explicit frame, loop, and timing semantics
The game SHALL represent an animated tile as an ordered non-empty sequence of qualified static-tile frames, an explicit loop value, and an explicit timing domain of `realTime` or `tickTime`. The system SHALL reject or safely omit an invalid animation definition rather than infer frames, timing, or loop behavior.

#### Scenario: Looping real-time animated tile advances continuously
- **WHEN** an eligible looping `realTime` animated tile is presented at two distinct elapsed real-time values
- **THEN** both presentations resolve the frame dictated by the declared frame durations and wrap to the first frame after the final frame

#### Scenario: Non-looping animated tile holds its final frame
- **WHEN** an eligible non-looping animated tile reaches or exceeds the duration of its final frame
- **THEN** it resolves to the final frame and does not wrap to the first frame

#### Scenario: Tick-time animation advances only with world time
- **WHEN** an eligible `tickTime` animated tile is presented repeatedly without a new published world tick
- **THEN** it resolves to the same frame

#### Scenario: Tick-time animation advances on a world tick
- **WHEN** the world time advances to the next integer tick for an eligible `tickTime` animated tile
- **THEN** its resolved frame advances according to its declared tick-frame cadence without adding a timer or another logical tick

### Requirement: Shared timing preserves renderer and simulation boundaries
The game SHALL resolve presentation frames from a shared real-time value or the authoritative published world-time integer. It SHALL not create one timer, one real-time loop, or one world-time producer per tile, and presentation frame selection SHALL not mutate simulation state.

#### Scenario: Visible instances share a clock
- **WHEN** multiple eligible instances refer to the same looping animated tile and timing domain
- **THEN** they resolve the same frame for the same supplied time value without independent per-instance clocks

#### Scenario: Presentation does not create gameplay ticks
- **WHEN** an animated tile updates solely because real time elapsed
- **THEN** world time, entity tick delivery, collision, and gameplay consequences remain unchanged

### Requirement: Existing animation behavior has an explicit migration profile
The game SHALL register each currently rendered animation with an explicit tile/animation profile before removing its bespoke frame-selection path. The profile table SHALL retain the following initial timing and loop choices: water (looping, `realTime`); gold coin (looping, `realTime`); torch (looping, `realTime`); trap (looping, `realTime`); hero idle/run (looping, `realTime`); hero attack/death (non-looping, `realTime`); Spider idle (looping, `realTime`); Spider move/attack/death (non-looping, `realTime`); each particle effect (non-looping, `realTime`); health-bar fade/delta (non-looping, `realTime`); floating combat text (non-looping, `realTime`); realm transition (non-looping, `realTime`); toast motion (non-looping, `realTime`); and character-info health delta (non-looping, `realTime`).

#### Scenario: Migrated continuous animation retains its cadence
- **WHEN** the migrated game presents water, a character, or another profile declared `realTime`
- **THEN** its frames progress while no player action occurs and no world tick is published

#### Scenario: Future deterministic animation opts into tick time
- **WHEN** a future animation is registered with `tickTime`
- **THEN** it remains visually stationary between published ticks and advances only from authoritative world time

### Requirement: Renderer adapters preserve established layer behavior
The game SHALL allow the common tile definitions to be rendered by its existing terrain atlas/raster path, DOM strip/image overlays, and canvas/image particle path. Migration SHALL retain the current fog culling, visible-region lifecycle, cell anchoring, source aspect ratio, layer order, and disposal behavior for each presentation family.

#### Scenario: Animated terrain remains beneath overlays
- **WHEN** animated water is visible beneath an eligible object, character, or particle presentation
- **THEN** the water remains in the terrain layer and the established higher presentation remains visible above it

#### Scenario: Offscreen animated overlays do not keep rendering
- **WHEN** an animated overlay instance leaves the visible region, fails fog eligibility, or is disposed
- **THEN** its adapter removes or stops presenting that instance while the shared timing service remains available to other eligible instances
