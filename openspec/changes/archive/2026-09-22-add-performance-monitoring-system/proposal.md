# Proposal

## Why

The game already exposes a basic FPS HUD and has scattered startup/render timing
logs, but there is no repeatable, durable way to compare idle, directional
movement, sprint movement, first-playable readiness, or the separate game and
minimap render costs. This change creates an opt-in diagnostic system so future
performance investigations can use the same measurements without imposing
continuous profiling overhead or making the HUD noisy for normal play.

## What Changes

- Add an opt-in performance-monitoring service owned by the game/client boundary
  that can start, stop, clear, and snapshot bounded measurement sessions.
- Measure FPS and frame-time distributions for explicit scenarios: idle,
  movement in one direction, and sprint movement in one direction. Reports SHALL
  include sample duration, frame count, average FPS, and useful percentile or
  worst-frame information so averages do not hide stutters.
- Measure startup readiness from app/game-layer start through the first playable
  world state and first valid visible world render, while retaining the existing
  generation-phase and first-render timings as component measurements.
- Measure main game-world composition/submission time and minimap composition /
  canvas-render time independently, including enough context to compare visible
  cell counts, submitted/skipped cells, cache warmup, and whether the sample was
  cold or cached.
- Provide a developer-facing way to request a report and make the current
  diagnostic data available without requiring the monitor to run continuously.
- Keep the existing compact FPS HUD behavior intact; monitoring is disabled by
  default and must not change gameplay, rendering output, persistence, or normal
  startup behavior when unused.
- Define an extensible list of future measurements, initially including input-to-
  movement latency, frame pacing/jank, world-generation yields and wait time,
  glyph-cache warmup/hit behavior, visible/submitted/skipped cell counts, GPU
  light-pass cost, health-bar animation cost, and realm-transition readiness.

## Capabilities

### New Capabilities

- `performance-monitoring`: Opt-in, repeatable client performance sessions and
  reports for frame rate, startup readiness, and separated game/minimap render
  timings.

### Modified Capabilities

None. Existing movement/rendering and world-view requirements remain behavioral
contracts; this change adds diagnostics around them rather than changing those
requirements.

## Impact

- Affected client areas: `ascii-rpg/src/client/game-layer-babylon-lite/`, the
  bridge used for developer diagnostics, and the React developer-facing surface
  or console/report presentation.
- Affected test areas: client unit tests for session aggregation and lifecycle,
  source/integration checks for instrumentation boundaries, and manual browser
  verification of the three movement scenarios plus startup readiness.
- No new production dependency is expected; use the existing high-resolution
  browser timing APIs and requestAnimationFrame lifecycle.
- The initial benchmark run is a baseline measurement, not a release gate until
  the recorded environment, viewport, browser, zoom, lighting, and scenario
  duration are captured consistently. Any performance budgets introduced later
  must be explicit and separately approved.
- Unresolved presentation decision: prefer a developer-only console/export report
  first, while keeping the measurement API independent of whether a future UI
  panel is added. The implementation plan should not add a persistent visible
  settings control unless that is selected during implementation.
