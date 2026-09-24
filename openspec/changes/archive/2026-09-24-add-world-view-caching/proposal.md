# Proposal

## Why

The game recreates view compositions and canvas pixels even when their visible
world output is unchanged or only a small area changed. Babylon Lite already
caches and replays stable opaque WebGPU draw calls, so the remaining opportunity
is to avoid redundant CPU composition and canvas work without duplicating the
engine's retained draw-call behavior.

## What Changes

- Add a shared world-view caching contract for the game world view, minimap,
  fullscreen developer mapview, and generation-settings preview.
- Skip a view refresh when a semantic visual revision proves its output is
  unchanged; preserve the current displayed result without rebuilding its
  composition.
- Retain cacheable static content separately from dynamic fog, lighting,
  marker, actor, and transient-overlay presentation so a local change can patch
  only its affected cells or regions.
- Use measured dirty coverage and rectangle fragmentation to choose a partial
  refresh or a complete redraw for each view; viewport, renderer, font, palette,
  realm, and other incompatible changes remain explicit full-refresh paths.
- Preserve Babylon Lite's built-in stable opaque WebGPU draw-bundle caching for
  the main game view rather than adding a competing flattened bitmap cache.
- Record cache decisions and refresh scope through the existing opt-in
  performance instrumentation so thresholds can be selected from evidence.

## Capabilities

### New Capabilities

- `world-view-caching`: Defines retained per-view presentation, semantic
  invalidation, bounded dirty-region patching, and full-redraw fallback while
  preserving established world-view output.

### Modified Capabilities

- None.

## Impact

- Affected client systems: shared world-view composition, Babylon Lite game
  renderer submission, minimap and mapview canvases, generation-settings map
  preview, visual invalidation, and opt-in performance diagnostics.
- No gameplay, persistence, network, dependency, or public API changes are
  expected.
- Acceptance requires focused renderer/cache checks, production build, and
  manual browser comparison of idle, movement, fog, lighting, markers, mapview,
  and preview behavior.
