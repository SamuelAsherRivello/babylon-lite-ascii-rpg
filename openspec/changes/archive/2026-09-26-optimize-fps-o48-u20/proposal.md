# Proposal

## Why

Sprinting in a medium world exposes expensive enemy navigation and a deferred queue that can accumulate thousands of callbacks. FPS averages can conceal several seconds of simulation lag, so both frame pacing and actual movement need verification.

## What Changes

- Test every optional procedural layer independently using URL overrides, then verify all layers at Med density in both realms.
- Prevent continuous input from restarting the deferred queue's presentation delay.
- Reduce enemy navigation allocations and repeated sector searches; reuse valid routes with explicit invalidation.
- Retain unchanged torch-source snapshots and reuse identical minimap tint rasters without changing lighting output.
- Provide an opt-in bounded sprint diagnostic with actual movement, per-second FPS, frame times, realm, and pending-work measurements.
- Target at least 48 sampled FPS in Overground and 20 sampled FPS in
  Underground while sprinting in Med worlds on the documented desktop baseline,
  with all layers enabled and no accumulating simulation lag.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `movement-render-performance`: add the medium-world, realm-specific 48 FPS
  Overground and 20 FPS Underground acceptance case.
- `performance-monitoring`: add reproducible procedural-layer sprint comparisons and reject stalled/dead runs as successful movement evidence.

## Impact

Game scheduling, navigation, lighting cache, object source snapshots, minimap raster keys, diagnostic reporting, and focused Node tests. No new dependencies, density reductions, autonomous game ticks, renderer replacement, release, or deployment. Existing unrelated work and concurrent commits remain intact.

This change captures investigation and fixes already authorized in the conversation; remaining verification proceeds under the user's explicit apply request.
