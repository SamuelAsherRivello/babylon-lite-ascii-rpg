# Design

## Context

See `proposal.md` for motivation and `specs/world-view-caching/spec.md` for the behavior contract. The game world view is a Babylon Lite sprite submission path with existing per-sprite state comparison, glyph-atlas reuse, a cached lighting field, and coalesced semantic invalidation for world and minimap refreshes. The minimap, mapview, and settings preview are canvas paths that currently compose and repaint their content more broadly than necessary.

Babylon Lite already replays stable opaque draw calls through WebGPU render bundles by default; it still performs some scene, lighting, and binding work per frame. [Babylon Lite maintainers](https://forum.babylonjs.com/t/lite-about-snapshot-rendering-support/63969) describe this as similar to, but distinct from, FAST Snapshot Rendering.

## Goals / Non-Goals

**Goals:**

- Eliminate avoidable CPU composition and canvas paint work for stable views.
- Let a local visual change update bounded cells or overlays while preserving established fog, lighting, glyph, marker, and transient-presentation output.
- Make refresh decisions measurable through the existing opt-in monitor.
- Keep retained memory bounded and respect current mapview/preview disposal.

**Non-Goals:**

- Replacing Babylon Lite render bundles, adding Snapshot Rendering APIs, or flattening the main world view into a competing bitmap cache.
- Changing simulation, fog discovery, view geometry, visual quality, renderer fallback behavior, or persisted user settings.
- Adding dependencies, telemetry, persistent performance history, or Playwright coverage.

## Decisions

### 1. Cache at the view and layer boundary

Each view receives a semantic revision/fingerprint for its compatible geometry, world source, style, and enabled layers. Retain static world-content data apart from dynamic fog, light, marker, actor, health-bar, and floating-text layers. This permits a dynamic layer to change without treating the entire view as a new static bitmap.

Alternative considered: one flattened canvas or bitmap per view. Rejected for the main game view because it duplicates engine-managed stable draw replay and would make dynamic presentation invalidation less precise.

### 2. Preserve the existing Babylon Lite game-view ownership

The main view keeps its sprite atlas, retained layer, and per-sprite comparison. The cache work short-circuits unchanged composition, records explicit dirty cells for compatible changes, and delegates stable opaque submission reuse to Babylon Lite. A viewport movement that remaps slots, renderer rebuild, realm swap, or incompatible visual configuration takes the established full-region path.

Alternative considered: render the main view to an offscreen 2D canvas and blit it every frame. Rejected because it sacrifices the current WebGPU retained path and complicates GPU light, health-bar, and floating-text layering.

### 3. Use retained base and dynamic overlays for canvas views

The minimap, mapview, and settings preview retain completed base-world content for their current compatible source, scale, and canvas geometry. Fog, lighting, markers, and other changing presentation are separate patchable overlays or dirty regions. Mapview and preview continue using cancellable cooperative work for cold or full rebuilds.

Alternative considered: a full-resolution canvas per realm and scale. Rejected unless profiling proves it bounded across device pixel ratios and all supported scales; it risks excessive backing-store memory.

### 4. Choose partial versus full refresh from measured cost

Collect dirty-cell coverage, coalesced dirty rectangles, refresh reason, visible-cell count, and elapsed phase time. Start with a conservative, configuration-owned boundary and tune it only from comparable baseline data. The decision must account for both coverage and fragmentation: a scattered set of cells may cost more than a contiguous region of greater area.

Alternative considered: a fixed universal percentage. Rejected because game sprite submission, minimap canvas work, and full-realm mapview work have different cost curves.

### 5. Keep invalidation complete and lifecycle-bound

The invalidation model explicitly covers world/realm replacement, source crop, viewport/canvas size, device pixel ratio, zoom, font, glyph offsets, palette, fog, lighting sources/settings, actor state, markers, GPU effects, and transient overlays. Every cache owns a bounded eviction/disposal path; mapview close and preview replacement release their view-only resources.

## Risks / Trade-offs

- [Risk] An omitted invalidation input shows stale content. -> Enumerate every visual input in focused tests and compare partial versus full refresh output.
- [Risk] Dirty tracking costs more than a small redraw. -> Measure selection, coverage, fragmentation, and phase time; fall back to full refresh.
- [Risk] Layer separation changes pass order or visual parity. -> Preserve the existing world-background, glyph, lighting, GPU-light, marker, and transient overlay ordering in each view.
- [Risk] Retained canvas backing stores grow with scale or device pixel ratio. -> Bound entries, measure their sizes, and release view-only resources at their existing lifecycle boundaries.
- [Risk] Other work already dirties planning files. -> Limit implementation and staging to files attributable to this change.

## Migration Plan

Implement behind the existing rendering paths without persisted data migration. First establish an opt-in baseline, then add unchanged-refresh skips, then add partial canvas and game-view updates. Compare each step with the complete refresh output and retain only optimizations that preserve the movement frame rate requirement. If a cache path is unsafe or slower, invalidate it and use the complete refresh path while retaining instrumentation.
