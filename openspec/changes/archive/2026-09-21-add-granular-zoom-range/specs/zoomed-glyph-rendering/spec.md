# Spec Delta

## MODIFIED Requirements

### Requirement: Zoom-appropriate glyph fidelity
The game SHALL render the active font and visible glyphs using visual representations appropriate to every effective scale produced by displayed zooms `1` through `10`. The representation SHALL preserve a recognizable glyph silhouette at displayed zoom `1`, SHALL remain consistent with the current zoom-10 appearance at displayed zoom `10`, and SHALL provide usable intermediate fidelity for displayed zooms `2` through `9`.

#### Scenario: Farthest supported zoom
- **WHEN** the player sets displayed zoom to `1`
- **THEN** visible glyphs SHALL remain recognizable at the new farthest effective scale and SHALL not rely only on a severely downscaled copy of the current default-resolution glyph bitmap

#### Scenario: Closest supported zoom
- **WHEN** the player sets displayed zoom to `10`
- **THEN** glyph rendering SHALL match the current zoom-10 path closely enough that the endpoint remains visually familiar

#### Scenario: Furthest supported zoom
- **WHEN** the player sets displayed zoom to `1`
- **THEN** visible glyphs SHALL remain recognizable at the farthest effective scale

#### Scenario: Default zoom
- **WHEN** the player selects the migrated default displayed value
- **THEN** glyph rendering SHALL retain the current default visual quality

### Requirement: Visible-region rendering
The game SHALL submit renderable cells only for the current visible region at the effective scale selected by the displayed value, and cells outside that region SHALL not contribute visible sprites to the frame.

#### Scenario: Large visible region
- **WHEN** displayed zoom `1` produces a substantially larger visible region
- **THEN** the renderer SHALL cull cells outside the viewport, remain bounded by world dimensions, and preserve correct terrain and character layering

#### Scenario: Large world with normal viewport
- **WHEN** world dimensions exceed the current viewport
- **THEN** cells outside the viewport SHALL be excluded from the visible sprite set

#### Scenario: Diagnostic extreme viewport
- **WHEN** a diagnostic run uses an effective scale below the normal current minimum
- **THEN** culling SHALL remain bounded by world dimensions

### Requirement: Fast cached zoom rerender
After the required glyph visuals for an effective scale are cached, a displayed zoom change SHALL rebuild and submit only the current visible region without rebuilding complete world data. The interval from the zoom-change request to visible-region submission SHALL target completion within one 60 Hz frame, approximately 16.7 milliseconds, on the baseline development environment. Cold-cache visual generation SHALL be measured separately.

#### Scenario: Adjacent remapped zoom change
- **WHEN** the player changes by one displayed zoom step
- **THEN** the runtime SHALL reuse compatible cached glyph visuals where possible, submit the new visible region, and SHALL not regenerate the world

#### Scenario: Cached zoom change
- **WHEN** required visuals for the destination displayed value are cached
- **THEN** the new visible region SHALL submit without generating the world again

#### Scenario: Cold zoom change
- **WHEN** required visuals for the destination displayed value are not cached
- **THEN** the runtime SHALL warm only required visible visuals and report warmup separately

### Requirement: Rendering stress validation
The rendering implementation SHALL provide focused validation or diagnostics for displayed zooms `1`, `5`, and `10`, representative intermediate values, and the corresponding minimap state. Validation SHALL cover visible-cell count, cache reuse, culling behavior, redraw work, memory growth, and bounded cache size.

#### Scenario: Remapped-range comparison
- **WHEN** rendering is validated across displayed zooms `1`, `5`, and `10`
- **THEN** validation SHALL record effective scale, visible-cell count, cache behavior, culling correctness, and cached rerender timing for each anchor

#### Scenario: Representative zoom comparison
- **WHEN** representative displayed zooms are validated
- **THEN** glyph cache behavior and visible rendering correctness SHALL be recorded

#### Scenario: Extreme visible-cell stress
- **WHEN** the farthest displayed zoom exposes a substantially larger visible region
- **THEN** off-screen cells SHALL remain culled and cache growth SHALL remain bounded

#### Scenario: Readiness and zoom budgets
- **WHEN** performance validation runs
- **THEN** world readiness, cold warmup, and cached rerender timings SHALL be reported against the existing budgets
