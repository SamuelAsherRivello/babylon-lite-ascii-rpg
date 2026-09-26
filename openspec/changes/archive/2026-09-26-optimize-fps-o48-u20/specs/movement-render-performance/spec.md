## ADDED Requirements

### Requirement: Medium worlds support realm-specific sprint FPS floors

On the documented desktop benchmark environment, medium worlds with every
procedural layer enabled at Med density SHALL sustain at least 48 sampled FPS
in Overground and at least 20 sampled FPS in Underground during actual
Shift-modified movement. Optimization SHALL preserve gameplay density,
player-driven ticks, and established visual output.

#### Scenario: Both realms sustain movement

- **WHEN** an alive player sprints for at least thirty seconds in each medium realm using a fixed seed
- **THEN** every complete one-second Overground FPS sample SHALL be at least 48,
  every complete one-second Underground FPS sample SHALL be at least 20,
  movement SHALL continue throughout the run, and deferred simulation work
  SHALL not accumulate unbounded lag

#### Scenario: Repeatability is documented

- **WHEN** the optimization is verified
- **THEN** the evidence SHALL include a second fixed-seed run, natural viewport and device scale, frame percentiles, actual movement, and deferred-work measurements
