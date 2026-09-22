# Spec Delta

## Purpose

Provides an opt-in, repeatable performance diagnostic contract for comparing
interactive frame rate, startup readiness, and the separate costs of rendering
the main game world and exploration minimap.

## ADDED Requirements

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
