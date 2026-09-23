# Design

## Context

See `proposal.md` for motivation. The client already owns world generation,
input locking, the main world render path, minimap rendering, and startup timing
fields in `game-layer-babylon-lite/index.js`. React currently runs an independent
once-per-second `requestAnimationFrame` FPS display. Existing logs are useful for
one-off inspection but are not a reusable session/report API, and the two render
paths are not reported as comparable phase samples.

## Goals / Non-Goals

**Goals:**

- Establish one client-owned, opt-in collector with bounded memory and explicit
  session lifecycle.
- Reuse the existing high-resolution `performance.now()` and animation-frame
  boundaries instead of adding a production profiling dependency.
- Keep the existing React FPS HUD as presentation, while making its sampling
  logic and richer reports available to developer diagnostics.
- Preserve layer boundaries: the game layer measures world/minimap work; the
  bridge exposes narrow diagnostic snapshots; React or the console presents them.
- Make startup, idle, normal movement, sprint movement, main-world, and minimap
  samples distinguishable and exportable.
- Keep a concise human-readable scan history in
  `output/performance-analysis/performance-monitoring.md`, appended only after a
  completed scan and limited to 10–100 words per entry.

**Non-Goals:**

- No always-on profiler, telemetry upload, analytics service, or persisted
  performance history.
- No new user-facing settings control in the initial implementation.
- No automatic performance budget failure until a stable browser/device baseline
  is explicitly selected.
- No raw sample archive or automatic persistence of detailed reports; the
  Markdown file stores only the concise result summary.
- No change to movement cadence, rendering algorithms, world generation, or
  visible HUD wording as part of instrumentation alone.

## Decisions

1. **Use a bounded session collector.** A small collector records frame samples
   and phase samples only while a named session is active, then computes summary
   statistics and releases raw samples after report creation. This keeps unused
   overhead near zero. A permanent ring buffer was considered, but would add
   work and ambiguity to ordinary gameplay.

2. **Measure at existing ownership boundaries.** Instrument the generation/startup
   lifecycle, `renderWorld`, and `renderMinimap` at their current boundaries.
   Main-world timing ends after world composition/sprite submission work; minimap
   timing ends after its canvas composition and overlays. The browser's final GPU
   presentation remains a separate frame-time signal rather than being falsely
   attributed to either path.

3. **Represent scenarios explicitly.** The session metadata records scenario,
   direction, sprint state, duration, viewport, zoom, device-pixel ratio, and
   browser/client identifiers that are safe to disclose. Scenario changes end
   the current sample set rather than mixing modes. This makes the requested
   idle/normal/sprint comparison reproducible.

4. **Expose a narrow diagnostic bridge.** Add start/stop/reset/get-report
   operations through the existing game bridge rather than exposing mutable world
   state to React. The initial presentation can log or return JSON; a future
   developer panel can consume the same shape without changing instrumentation.

5. **Keep startup timing semantics explicit.** Record separate marks for client
   start, generation complete, first valid visible render, and input unlock. The
   report's primary "time to playable" uses the latest required boundary (input
   unlock after a valid render), while component fields explain where the time
  went. Existing console readiness logs remain compatible or are emitted from
  the new report.

6. **Use a staged startup critical path.** The active realm, its visible world,
   movement dependencies, and the minimum active-realm fog/discovery state are
   required before input unlock. Secondary realm preparation, full mapview
   refresh, and other non-critical work may be scheduled after the first
   playable frame. The one-second target applies to the active-realm readiness
   boundary, not to every background initialization task.

7. **Test aggregation independently from browser proof.** Pure unit tests cover
   sample aggregation, percentile/worst-frame calculation, scenario isolation,
   lifecycle, and report redaction. Manual browser verification covers the actual
   four requested runs and records the exact URL and environment. Playwright is
  not introduced under this repository's browser-test policy.

8. **Store scan summaries in one canonical Markdown log.** The implementation
   writes or prepares one append-only entry at
   `output/performance-analysis/performance-monitoring.md` after a completed scan.
   The entry is deliberately short and human-readable so future scans remain
   comparable in project history without turning the repository into a raw
   telemetry store. A generated report may be copied into the entry workflow,
   but the detailed structured report is not persisted automatically.

## Risks / Trade-offs

- [Risk] Instrumentation around canvas or WebGPU work may perturb timings → keep
  timing calls conditional on an active session and compare warm/cold samples.
- [Risk] Average FPS can hide intermittent stalls → include frame count,
  high-percentile or worst-frame time, and frame-time summaries.
- [Risk] Browser throttling or background tabs can invalidate results → record
  visibility/focus context and mark sessions interrupted or invalid when needed.
- [Risk] Startup timing can vary with generation seed and device → capture seed
  only as a non-exported internal correlation value, report environment context,
  and avoid treating the first run as a universal budget.
- [Risk] Existing dirty work overlaps client files → implementation must stage
  only attributable files and preserve unrelated changes.
- [Risk] Unlocking input before deferred realm setup is complete can expose
  transition or minimap races → gate only the active-realm movement path and
  add deferred-completion checks before allowing realm transitions.

## Migration Plan

Add the collector and bridge in disabled-by-default mode, route existing startup
and render timing logs through the structured report where practical, then run
the manual baseline matrix. If instrumentation causes regressions, remove the
bridge activation and leave the collector code dormant; no persisted data or
schema migration is required.

## Open Questions

- The initial developer trigger remains intentionally implementation-level: the
  proposal recommends console/export first. A future UI panel can be selected
  after the first baseline report is reviewed.
