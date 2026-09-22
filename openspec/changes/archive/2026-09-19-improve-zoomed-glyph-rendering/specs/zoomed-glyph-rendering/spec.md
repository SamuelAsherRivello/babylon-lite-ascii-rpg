# Spec Delta

## Purpose

Provides recognizable, high-fidelity ASCII glyph rendering across the supported zoom range while reusing bounded visual data and avoiding unnecessary redraw work for cells outside the visible or changed region.

## ADDED Requirements

### Requirement: Zoom-appropriate glyph fidelity

The game SHALL render the active font and visible glyphs using visual representations appropriate to the current zoom level. The representation SHALL preserve a recognizable glyph silhouette at zoom 1, SHALL remain crisp at the default zoom 5, and SHALL provide visibly smoother or more detailed edges at zoom 10 than the current single-resolution rendering.

#### Scenario: Furthest supported zoom

- **WHEN** the player sets zoom to 1
- **THEN** visible glyphs SHALL remain recognizable and SHALL not rely only on a severely downscaled copy of the default-resolution glyph bitmap

#### Scenario: Default zoom

- **WHEN** the player sets zoom to 5
- **THEN** glyph rendering SHALL retain the current acceptable appearance while improving edge consistency where the higher-fidelity representation permits it

#### Scenario: Closest supported zoom

- **WHEN** the player sets zoom to 10
- **THEN** curved and diagonal glyph features SHALL render with sharper or smoother contours than the current fixed 64x64 bitmap path

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
- **THEN** the client SHALL create it on demand and SHALL not require prebuilding the complete palette before rendering the current visible region

### Requirement: Visible-region rendering

The game SHALL submit renderable cells only for the current visible region, and cells outside that region SHALL not contribute visible sprites to the frame.

#### Scenario: Large world with normal viewport

- **WHEN** the world dimensions exceed the current viewport
- **THEN** cells outside the viewport SHALL be excluded from the visible sprite set

#### Scenario: Diagnostic extreme viewport

- **WHEN** a diagnostic run uses a zoom value below the user-facing minimum to expose a substantially larger visible region
- **THEN** the renderer SHALL continue to exclude world cells outside the calculated viewport and SHALL remain bounded by the world dimensions

### Requirement: Responsive staged world readiness

The game SHALL construct complete world data cooperatively across bounded work slices so generation does not monopolize the browser main thread for the entire operation. The end-to-end operation from generation start through complete world-data availability and the first valid render of the current visible region SHALL target completion in under 1 second and SHOULD approach 0.1 seconds on the baseline development environment.

#### Scenario: World generation yields to the browser

- **WHEN** a world requires multiple generation passes or attempts
- **THEN** generation SHALL yield between bounded work slices so browser input and rendering scheduling remain responsive while the world is being built

#### Scenario: Complete world and visible frame

- **WHEN** generation begins for the configured world and viewport
- **THEN** the client SHALL measure the interval until complete world data exists and the current visible region has been rendered, with a target below 1 second and an ideal target near 0.1 seconds

#### Scenario: No invalid partial world is exposed

- **WHEN** world data is not yet complete
- **THEN** the client SHALL not expose a partially generated terrain or invalid player state as if it were a playable completed world

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

After the required glyph visuals for a supported zoom are cached, a zoom change SHALL rebuild and submit only the current visible region without rebuilding complete world data. The interval from the zoom-change request to visible-region submission SHALL target completion within one 60 Hz frame, approximately 16.7 milliseconds, on the baseline development environment. Cold-cache visual generation SHALL be measured separately and SHALL not invalidate correctness.

#### Scenario: Cached zoom change

- **WHEN** the player changes between supported zoom levels whose required visible glyph visuals are cached
- **THEN** the renderer SHALL submit the new visible region without generating the world again and SHALL target approximately 16.7 milliseconds or less

#### Scenario: Cold zoom change

- **WHEN** the player changes to a zoom whose required glyph visuals are not cached
- **THEN** the client SHALL lazily warm the required visible glyph visuals, report warmup separately, and then submit only the visible region

### Requirement: Future-effect-safe cache boundary

Static cached glyph visuals SHALL represent glyph shape or base appearance only. Future animation, shader effects, and time-varying coloration SHALL remain applicable at render time without requiring the static glyph cache to contain a separate entry for every animation state.

#### Scenario: Animated presentation extension

- **WHEN** a future renderer applies a time-varying effect to a glyph
- **THEN** the effect SHALL be able to vary the presentation without invalidating every reusable static glyph-shape entry

### Requirement: Rendering stress validation

The rendering implementation SHALL provide focused validation or diagnostics for representative supported zooms and at least one substantially farther diagnostic zoom, covering visible-cell count, cache reuse, culling behavior, redraw work, and memory growth or bounded cache size.

#### Scenario: Representative zoom comparison

- **WHEN** rendering is validated at zooms 1, 5, and 10
- **THEN** the validation SHALL record or assert glyph cache behavior and visible rendering correctness for each level

#### Scenario: Extreme visible-cell stress

- **WHEN** rendering is validated at a diagnostic zoom below 1
- **THEN** the validation SHALL demonstrate that off-screen cells remain culled and that cache growth remains bounded by the configured glyph/font/zoom key space rather than by the total world area

#### Scenario: Readiness and zoom budgets

- **WHEN** performance validation runs on the baseline development environment
- **THEN** it SHALL report world-data build time, first-visible-render time, total readiness time, cold glyph warmup time, and cached zoom-rerender time against the under-1-second, approximately 0.1-second ideal, and approximately 16.7-millisecond targets
