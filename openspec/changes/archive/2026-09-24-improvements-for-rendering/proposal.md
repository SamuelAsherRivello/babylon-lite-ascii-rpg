# Proposal

## Why

The existing monitor can report idle, movement, and sprint performance, but a
failed generated-world startup prevents valid movement samples and disposal can
be mistaken for a real WebGPU device loss. The last valid run was display-rate
limited, so improvements need reproducible frame-pacing evidence before adding
render complexity.

## What Changes

- Make movement and sprint profiling explicitly wait for a playable world and
  report an unavailable or interrupted run accurately when startup cannot reach
  that state.
- Distinguish intentional renderer disposal from genuine WebGPU device loss.
- Record movement/sprint frame-pacing and separate main-world/minimap costs in
  a reproducible fixed-environment profile matrix.
- Use the measurements to remove redundant movement-driven minimap or
  presentation work while preserving all established world, fog, lighting, and
  GPU-light visuals.
- Keep normal play profiling-disabled, preserve the narrow React/game bridge,
  and add no telemetry or dependencies.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `performance-monitoring`: Profile runs have a trustworthy playable-start
  boundary and distinguish unavailable startup from a completed measurement.
- `movement-render-performance`: Movement presentation uses measured,
  coalesced minimap and world work without degrading frame pacing or visible
  results.

## Impact

- Affected client: performance monitor, game-layer lifecycle and render
  scheduling, minimap refresh scheduling, and their focused Node tests.
- Affected validation: fixed-seed production browser idle/movement/sprint
  reports, frame-time comparison, visual regression checks, full Node suite,
  and production build.
- No new dependency, visible settings control, fallback renderer, telemetry,
  or gameplay-rule change.
