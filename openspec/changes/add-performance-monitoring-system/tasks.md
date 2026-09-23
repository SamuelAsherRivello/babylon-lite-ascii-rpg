# Tasks

## 1. Collector and report model

- [x] 1.1 Add a dependency-free bounded performance session collector with named scenarios, explicit start/stop/reset lifecycle, frame samples, phase samples, averages, percentiles/worst-frame values, and scenario isolation; verify focused client unit tests cover empty, active, completed, interrupted, and finite-duration sessions.
- [x] 1.2 Define the privacy-safe structured report shape and environment metadata, including idle/normal-movement/sprint labels, direction, viewport, zoom, DPR, duration, frame count, average FPS, average frame time, and stutter-sensitive timing; verify report tests reject secret, storage, seed, and gameplay-state fields.

## 2. Client instrumentation

- [x] 2.1 Instrument the existing startup lifecycle to record client start, generation phases, generation yields/wait, generation completion, first valid visible world render, and input unlock; verify startup unit/integration checks distinguish incomplete readiness from playable readiness.
- [x] 2.2 Instrument the existing main-world render boundary and minimap render boundary as independent conditional phases, preserving visible output and returning visible/submitted/skipped-cell and glyph warmup/cached context; verify focused render tests prove the phases do not include each other.
- [x] 2.3 Connect animation-frame sampling to the existing FPS path without changing the current HUD, allowing diagnostics to classify idle, one-direction movement, and one-direction sprint sessions; verify source/client tests cover scenario metadata and disabled-by-default behavior.

## 3. Diagnostic access

- [x] 3.1 Expose narrow bridge operations to start, stop, reset, and retrieve/export the current diagnostic report without exposing mutable world state; verify bridge tests cover lifecycle, bounded reports, and safe serialization.
- [x] 3.2 Provide the initial developer-facing console or report trigger and document the exact baseline procedure for idle, normal directional movement, sprint directional movement, and startup timing; verify the procedure produces four separately labeled structured reports at the running project URL.
- [x] 3.3 Add the canonical append-only project log at `output/performance-analysis/performance-monitoring.md`; after each completed scan, append exactly one dated 10–100-word entry containing scenarios, headline measurements, and an optimization conclusion, and verify entries omit secrets, seeds, and raw samples.

## 4. Validation and baseline

- [ ] 4.1 Run focused performance collector, bridge, startup, and render tests plus the repository's full Node test suite and production build; verify unrelated dirty files remain unstaged and no Playwright tests are added or run.
- [x] 4.2 Manually benchmark the supported browser in a documented fixed environment: app open to playable, idle, one-direction movement, and one-direction sprint, recording average FPS, frame time, worst/high-percentile frame time, generation/readiness timing, main-world timing, and minimap timing; verify the report includes enough context to reproduce the run.
- [x] 4.3 Review the baseline for optimization candidates and append the 10–100-word result to `output/performance-analysis/performance-monitoring.md`; verify monitoring is disabled during ordinary play and that the existing HUD and gameplay visuals remain unchanged.
