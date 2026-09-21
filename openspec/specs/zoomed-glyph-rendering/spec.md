# zoomed-glyph-rendering

## Purpose

Provides recognizable, high-fidelity ASCII glyph rendering across the supported zoom range while reusing bounded visual data and avoiding unnecessary redraw work for cells outside the visible or changed region.

## Requirements

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

### Requirement: Reusable zoom-aware glyph cache

The game SHALL reuse a cached glyph visual for repeated renderings with the same font, glyph identity, and supported zoom level. Changing palette color or opacity SHALL update the visible style without requiring a separate cached glyph visual for every color and opacity combination.

#### Scenario: Repeated glyph reuse

- **WHEN** multiple visible cells use the same font, glyph, and zoom level
- **THEN** those cells SHALL reference the same reusable glyph visual data

#### Scenario: Palette style change

- **WHEN** a palette color or opacity changes for a visible glyph
- **THEN** the current rendering SHALL update its tint or opacity while preserving reusable glyph-shape cache entries

#### Scenario: Font change invalidation

- **WHEN** the active font changes
- **THEN** subsequent rendering SHALL use glyph visuals associated with the new font and SHALL NOT display stale visuals from the previous font

#### Scenario: Lazy cache population

- **WHEN** a glyph/font/zoom combination has not yet been requested
- **THEN** the runtime SHALL create it on demand and SHALL not require prebuilding the complete palette before rendering the current visible region

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

### Requirement: Responsive staged world readiness

The game SHALL construct complete world data cooperatively across bounded work slices so generation does not monopolize the browser main thread for the entire operation. The end-to-end operation from generation start through complete world-data availability and the first valid render of the current visible region SHALL target completion in under 1 second and SHOULD approach 0.1 seconds on the baseline development environment.

#### Scenario: World generation yields to the browser

- **WHEN** a world requires multiple generation passes or attempts
- **THEN** generation SHALL yield between bounded work slices so browser input and rendering scheduling remain responsive while the world is being built

#### Scenario: Complete world and visible frame

- **WHEN** generation begins for the configured world and viewport
- **THEN** the runtime SHALL measure the interval until complete world data exists and the current visible region has been rendered, with a target below 1 second and an ideal target near 0.1 seconds

#### Scenario: No invalid partial world is exposed

- **WHEN** world data is not yet complete
- **THEN** the runtime SHALL not expose a partially generated terrain or invalid player state as if it were a playable completed world

#### Scenario: Generation cancellation or replacement

- **WHEN** a new world request replaces an in-progress generation request
- **THEN** stale generation work SHALL not publish its world or overwrite the newer request's visible state

### Requirement: Avoid redundant redraw work

The game SHALL reuse unchanged rendering data and SHALL update only cells or regions whose visible glyph, style, position, zoom, or font-dependent visual has changed, except when a viewport or renderer rebuild requires a full visible-region refresh.

#### Scenario: Player movement

- **WHEN** the player moves without changing the viewport dimensions, font, zoom, or palette
- **THEN** the renderer SHALL not recreate unchanged visible cell visuals solely because one character cell changed

#### Scenario: Zoom change

- **WHEN** the player changes zoom
- **THEN** the renderer SHALL refresh the visible region using the cache for the new zoom level and SHALL not retain sprites positioned for the previous viewport

#### Scenario: Palette-only update

- **WHEN** a palette style changes without changing the visible glyph identity, font, zoom, or viewport
- **THEN** the renderer SHALL update affected visible styles without rebuilding static glyph visuals or refreshing off-screen cells

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

### Requirement: Future-effect-safe cache boundary

Static cached glyph visuals SHALL represent glyph shape or base appearance only. Future animation, shader effects, and time-varying coloration SHALL remain applicable at render time without requiring the static glyph cache to contain a separate entry for every animation state.

#### Scenario: Animated presentation extension

- **WHEN** a future renderer applies a time-varying effect to a glyph
- **THEN** the effect SHALL be able to vary the presentation without invalidating every reusable static glyph-shape entry

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
