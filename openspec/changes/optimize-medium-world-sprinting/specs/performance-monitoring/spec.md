## ADDED Requirements

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
