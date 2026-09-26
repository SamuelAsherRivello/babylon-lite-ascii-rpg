# Proposal

## Why

The recorded `optimize-fps-o48-u20` benchmark shows that medium-world
sprinting can still fall below the display baseline in both realms. The game
needs a deliberate follow-up that makes sustained sprinting reach the 60 FPS
desktop baseline without weakening gameplay or visual output.

## What Changes

- Profile the all-enabled, Med-density sprint path in both realms to identify
  the remaining frame and deferred-work bottlenecks.
- Optimize only measured movement, rendering, minimap, and deferred-work
  costs while retaining current gameplay density, player-driven ticks, and
  visual equivalence.
- Make the opt-in sprint diagnostic reliably distinguish a valid uninterrupted
  run from an obstructed or stalled one.
- Require two fixed-seed, thirty-second desktop sprint runs in each realm with
  every complete one-second sample at least 60 FPS.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `movement-render-performance`: raise the sustained desktop sprint acceptance
  floor from 45 FPS to 60 FPS for all-enabled, Med-density worlds in both
  realms, with valid uninterrupted movement.

## Impact

Potentially affects the Babylon Lite movement-presentation pipeline, minimap
rendering, deferred-work scheduling, sprint diagnostics, focused Node tests,
and the performance evidence report. No new dependencies, renderer
replacement, density reduction, autonomous ticks, release, or deployment is
planned.
