# Spec Delta

## ADDED Requirements

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
