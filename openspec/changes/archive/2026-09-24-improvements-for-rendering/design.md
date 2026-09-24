# Design

## Context

The existing opt-in performance monitor records idle, directional-movement, and
sprint samples while the game runs. Its production profiling route can currently
fail while generating a world before the player can move, and normal renderer
disposal can be reported through the same device-loss path used for an unexpected
GPU failure. Either condition makes an FPS result misleading.

The game already coalesces movement-driven work and exposes distinct world and
minimap render phases. This change makes those measurements trustworthy, then
uses them to avoid work whose visible output cannot have changed. It must retain
the existing world-view contract, including player position, fog, lighting, GPU
effects, map markers, and frame pacing.

## Goals / Non-Goals

**Goals:**

- Produce profile results only after a playable world and input are available.
- Classify startup failures and planned renderer disposal explicitly rather than
  reporting false FPS data or unexpected device loss.
- Capture comparable idle, movement, and sprint frame-pacing and phase-cost
  data in a fixed environment.
- Skip coalesced world or minimap refreshes only when a semantic visual
  invalidation check proves the output is unchanged.

**Non-Goals:**

- Rewriting the world renderer, changing movement gameplay, or reducing visual
  quality to manufacture a benchmark win.
- Adding background telemetry, persistent profile history, or a default-on
  profiler.
- Changing graphics fallback behavior unrelated to correct lifecycle handling.

## Decisions

### 1. Gate measured samples on playable-state readiness

The monitor session will arm from its existing opt-in entry point, but will begin
idle, movement, and sprint frame sampling only after the game reports that the
world is playable and movement input is enabled. A reproducible profile input
will be exercised through the real generated-world path. If startup cannot reach
that state, the session will terminate as `unavailable` or `interrupted` with a
reason and no completed FPS result. If the fixed profile input exposes a local
generation validation or retry defect, repair only the path needed to make the
profile scenario playable; generation redesign remains out of scope.

### 2. Give renderer teardown an explicit lifecycle state

Renderer lifecycle code will distinguish planned disposal from device loss.
Before intentionally destroying the engine or its resources, it will mark the
current lifecycle/token disposed; loss callbacks belonging to that token then
remain diagnostic only. A real device loss while the renderer is active still
terminates the profile as unavailable and follows existing recovery behavior.

### 3. Measure frame pacing and phase cost before choosing a refresh skip

The supported browser profile will use the same fixed environment for an
approximately ten-second idle, directional movement, and sprint pass. Reports
will retain frame count/FPS and add comparable frame-pacing and world/minimap
phase cost information sufficient to identify the dominant path. The existing
45 FPS movement requirement remains the authorized acceptance floor; the baseline and
post-change measurements determine whether an optimization is kept.

### 4. Use semantic invalidation revisions for coalesced movement work

The coalesced scheduler will retain the latest movement state and render reason.
World and minimap layers will each receive a revision/dirty decision derived
from the data that can affect their visible result. A queued update with no
relevant change may skip that layer; a player-position, viewport, fog, lighting,
palette, marker, or GPU-effect change must invalidate the applicable layer.
This preserves a single latest-state render while avoiding duplicate draws caused
by bursty movement events.

### 5. Validate through focused Node checks, build checks, and manual browser use

Focused tests will exercise profile terminal states, lifecycle token handling,
and scheduler/invalidation behavior. Repository policy excludes adding or
running Playwright tests for this work. Manual browser validation supplies the
real held-input movement and sprint evidence that source-level tests cannot
represent.

## Risks / Trade-offs

- An incomplete minimap invalidation key could leave markers or fog stale.
  Focused visual-state tests will enumerate all semantic inputs, and manual
  validation will compare visible movement, sprint, fog, and marker behavior.
- Device-loss callbacks can race teardown. Lifecycle tokens make stale callbacks
  harmless while preserving active-session failure reporting.
- Profiling instrumentation itself can perturb frame timings. It remains opt-in,
  uses bounded in-memory samples, and reports measurements separately from the
  game's frame loop.
- The fixed profile environment could uncover a broader world-generation issue.
  This change is limited to restoring the profile route or reporting a truthful
  terminal status; a redesign of generation is a separate change.

## Migration Plan

No data migration is needed. Profiling remains disabled unless explicitly
enabled. First capture a valid baseline in the fixed scenario, then enable each
invalidation optimization only when its focused checks and post-change profile
preserve visual behavior and meet the movement floor. If a skip proves unsafe,
remove that skip while retaining the reliable profile lifecycle diagnostics.

## Open Questions

None.
