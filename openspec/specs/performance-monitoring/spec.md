# performance-monitoring Specification

## Purpose
Provides an opt-in, repeatable performance diagnostic contract for comparing
interactive frame rate, startup readiness, and the separate costs of rendering
the main game world and exploration minimap.

## Requirements

### Requirement: Bounded opt-in monitoring sessions

The client SHALL expose a developer-facing monitoring session that can be
started with a named scenario and finite duration, stopped explicitly, reset,
and read as a structured report. Monitoring SHALL be disabled unless requested,
and an inactive session SHALL not add a continuous visible HUD, persistence
write, or unbounded sample buffer.

#### Scenario: Monitoring is absent during normal play

- **WHEN** a player starts and plays the game without requesting diagnostics
- **THEN** the existing gameplay, rendering, FPS HUD, and startup behavior SHALL
  remain unchanged and no performance report SHALL be emitted

#### Scenario: A session completes at its bound

- **WHEN** a developer starts a named diagnostic session with a finite duration
- **THEN** the client SHALL collect only that session's samples, stop at the
  requested bound, and expose a report with scenario, environment context,
  duration, and completion state

### Requirement: Movement frame-rate scenarios are comparable

The monitoring contract SHALL support separate idle, one-direction normal
movement, and one-direction sprint scenarios. Each report SHALL include sampled
frame count, elapsed duration, average FPS, average frame time, and at least a
worst-frame or high-percentile frame-time value. The report SHALL identify the
input mode and SHALL NOT combine samples from different scenarios.

#### Scenario: Idle baseline

- **WHEN** a developer records an idle session after the world is playable
- **THEN** the report SHALL contain the idle FPS and frame-time summary for that
  bounded interval

#### Scenario: Normal directional movement

- **WHEN** a developer records movement in one direction without sprint
- **THEN** the report SHALL contain only frames observed during that movement
  scenario and identify the direction and non-sprint input mode

#### Scenario: Sprint directional movement

- **WHEN** a developer records movement in one direction with sprint held
- **THEN** the report SHALL contain only frames observed during sprint movement
  and identify the direction and sprint input mode

### Requirement: Startup readiness is measurable from launch to playability

The client SHALL measure startup readiness from the app/game-layer start
boundary through generated world availability, first valid visible world render,
and the point at which gameplay input is unlocked. The report SHALL expose the
total interval and component timings for world generation, generation yields or
wait time, first visible game-world render, and first playable readiness.

#### Scenario: First playable world timing

- **WHEN** a new game starts and completes its initial world setup
- **THEN** the diagnostic report SHALL identify the elapsed time from the defined
  startup boundary until the player can move and the first valid world is shown

#### Scenario: Startup does not publish partial readiness

- **WHEN** world generation or initial rendering is still incomplete
- **THEN** the readiness report SHALL remain incomplete and SHALL not claim that
  gameplay is playable

### Requirement: Main-world and minimap costs are separated

The client SHALL record main game-world rendering and minimap rendering as
separate timed phases. Each phase report SHALL include elapsed samples and
relevant context such as visible region size, submitted/skipped cell counts,
glyph-cache warmup or cached status, and whether the sample was a movement,
startup, or ordinary refresh.

#### Scenario: Main world render timing

- **WHEN** the game-world composition and visible sprite submission run during a
  monitored session
- **THEN** the report SHALL attribute that duration to the main-world phase and
  SHALL not include minimap canvas work in that phase

#### Scenario: Minimap render timing

- **WHEN** the minimap composition and canvas drawing run during a monitored
  session
- **THEN** the report SHALL attribute that duration to the minimap phase and
  SHALL not merge it into the main-world phase

### Requirement: Reports are actionable and extensible

The report SHALL be exportable or loggable as structured, privacy-safe data
containing browser/client context needed to reproduce a measurement, without
including secrets or user content. The monitoring model SHALL permit future
metrics such as input-to-movement latency, frame pacing/jank, cache behavior,
GPU light-pass cost, health-bar animation cost, and realm-transition readiness
without changing the existing scenario report shape.

#### Scenario: Developer obtains a baseline report

- **WHEN** a developer completes idle, normal movement, sprint movement, and
  startup measurements
- **THEN** the system SHALL provide separate reports that can be compared by
  scenario, with averages and stutter-sensitive timing data visible

#### Scenario: Report contains no sensitive data

- **WHEN** a report is logged or exported
- **THEN** it SHALL omit credentials, storage contents, seeds, and unrelated
  gameplay data while retaining only diagnostic context and performance values

### Requirement: Profile runs report a valid playable-state outcome

The client SHALL start an idle, movement, or sprint measurement only after a
playable game world is available. If startup cannot reach playability, the
client SHALL expose an unavailable or interrupted diagnostic result with the
startup failure context and SHALL NOT publish the run as a completed FPS
measurement. Intentional renderer teardown SHALL NOT be reported as an
unexpected rendering-device loss.

#### Scenario: Playable movement profile

- **WHEN** a developer starts a fixed-environment movement or sprint profile
  and the game reaches a playable world
- **THEN** the report SHALL identify the scenario, input mode, completed
  duration, frame-pacing summary, and separate main-world and minimap timings

#### Scenario: Startup failure prevents a false FPS baseline

- **WHEN** startup fails before input is unlocked during a requested profile
- **THEN** the diagnostic result SHALL identify the run as unavailable or
  interrupted and SHALL not contain a completed movement or sprint FPS result

#### Scenario: Intentional disposal is not device loss

- **WHEN** the game layer intentionally disposes its renderer during cleanup
- **THEN** diagnostics SHALL not report that cleanup as an unexpected device
  loss

### Requirement: Startup readiness has a one-second target

The client SHALL target no more than `1,000 ms` from the startup measurement
boundary to the first valid active-realm render with movement input enabled on
the documented baseline environment. Work that is not required to render or
move within the active realm MAY continue after this readiness boundary, but it
SHALL not block the first playable state or corrupt later realm transitions.

#### Scenario: Active realm reaches the startup budget

- **WHEN** the app starts on the documented baseline environment
- **THEN** the startup report SHALL expose whether active-realm playability was
  reached within `1,000 ms`, including the active-realm and deferred-work timing
  needed to diagnose misses

#### Scenario: Deferred startup work completes safely

- **WHEN** secondary realm or non-critical preparation continues after input is
  enabled
- **THEN** its completion SHALL preserve world, movement, transition, minimap,
  and gameplay invariants without blocking already-enabled active-realm input

### Requirement: Layer costs and deferred readiness are separately observable
Opt-in generation diagnostics SHALL identify world dimensions, realm, feature, effective density/enablement, phase durations, generation attempts, yield wait, and deferred-work duration. They SHALL distinguish terrain-ready, complete visible placement, first complete view submission, presentation opportunity, input-ready, and deferred completion. An early terrain-only frame SHALL NOT be reported as complete layered readiness. Per-layer durations SHALL exclude unrelated phases and scheduling wait or identify those components separately. Existing privacy restrictions SHALL apply.

#### Scenario: Deferred NPC routes outlive first presentation
- **WHEN** a world presents all initial content before route preparation completes
- **THEN** diagnostics report separate complete-view and deferred-completion times, with queue wait and longest work slice visible

#### Scenario: Both realms share phase names
- **WHEN** the same generation phase runs for Overground and Underground
- **THEN** each realm retains its own duration and attempt count without overwriting the other realm's measurements

### Requirement: Comparable cold and cached performance evidence
Performance comparisons SHALL distinguish cold generation-to-complete-view, unchanged cached reuse, local dirty refresh, and incompatible full refresh for game view, minimap, mapview, and generation preview. The primary configuration SHALL use Med world size, all applicable features enabled, and Med densities. Low and High comparisons SHALL retain Med density unless explicitly identified as a separate density stress case. Reports SHALL include sample count and latency distribution, environment/build context, work scope/cache mode, and actual outcomes against soft targets: approximately 100 ms Low, 500 ms Med, and 1000 ms High for generation-to-complete-view, with Med game-view refresh targeting 100-500 ms or faster. Targets SHALL NOT throttle normal frame cadence, replace existing movement responsiveness requirements, justify omitted layers, or allow concealed deferred stalls. Missed targets SHALL be reported without claiming compliance.

#### Scenario: High world diagnostic isolation
- **WHEN** a developer compares the required-only High baseline, individual optional layers, and cumulative enabled layers
- **THEN** evidence identifies each configuration and retains a separate all-enabled production comparison

#### Scenario: Warm cache beats cold generation
- **WHEN** a cached refresh completes faster than a new world generation
- **THEN** the two are reported as different scenarios and the cached result is not substituted for generation readiness

#### Scenario: Soft target is missed
- **WHEN** a measured configuration exceeds its target
- **THEN** the report states the measured latency, remaining bottlenecks, and any deferred work impact without hiding content or reducing enabled density

### Requirement: Procedural sprint diagnostics demonstrate real movement

An explicitly opted-in bounded sprint diagnostic SHALL exercise the ordinary Shift and directional-input repeat path without generating independent logical ticks or changing gameplay rules. It SHALL report realm, world dimensions, actual movement, one-second FPS samples, frame pacing, and deferred work. It SHALL release held input on completion, interruption, or disposal.

#### Scenario: Individual layer comparisons

- **WHEN** an agent compares procedural layers
- **THEN** each optional layer SHALL be disabled independently with session-isolated URL overrides and a fixed seed, followed by all-enabled verification

#### Scenario: Invalid movement evidence is rejected

- **WHEN** a player dies, stops moving for a full sample interval, or the diagnostic is interrupted
- **THEN** the run SHALL NOT be reported as a successful sustained-movement benchmark

#### Scenario: Ordinary play remains unaffected

- **WHEN** the diagnostic URL opt-in is absent
- **THEN** the diagnostic SHALL neither drive input nor collect sprint samples
