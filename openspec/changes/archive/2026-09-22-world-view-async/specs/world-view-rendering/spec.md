# Spec Delta

## ADDED Requirements

### Requirement: Cooperative world-view rendering

The world-view renderer SHALL provide an opt-in cooperative rendering mode for
long-running world-view jobs. Cooperative rendering SHALL preserve the same
world-cell eligibility, destination geometry, enabled pass order, opacity,
lighting treatment, and overlay ordering as the synchronous renderer once the
job completes, while yielding browser control between bounded batches of work.
Callers that do not opt in SHALL retain the established synchronous rendering
behavior.

#### Scenario: Cooperative output matches synchronous output
- **WHEN** a world-view composition is rendered cooperatively with the same
  source, destination, fog, lighting, and overlay parameters as a synchronous
  render
- **THEN** the completed view presents the same eligible cells, visual ordering,
  opacity, lighting, and overlays as the synchronous render

#### Scenario: Long render yields between batches
- **WHEN** a cooperative world-view job has more cells to render than fit within
  its configured frame budget
- **THEN** it yields browser control and resumes from the next unrendered cell
  or row without restarting completed work

#### Scenario: Existing callers remain synchronous
- **WHEN** a caller uses the established world-view rendering entrypoint without
  opting in to cooperative rendering
- **THEN** the render completes synchronously with the same return values and
  behavior as before this change

### Requirement: Cooperative render cancellation

The cooperative world-view renderer SHALL allow a caller to cancel a pending
render job. A cancelled job SHALL stop before drawing additional cells or
overlays, SHALL NOT report itself as completed, and SHALL leave ownership of
any cleanup or replacement render to the caller.

#### Scenario: Cancelled job stops drawing stale content
- **WHEN** a cooperative world-view render job is cancelled before all cells and
  overlays are rendered
- **THEN** no later batch from that job draws additional world content or
  overlays
- **AND** the caller can start a replacement render for the current state

