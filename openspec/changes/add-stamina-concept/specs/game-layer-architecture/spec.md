# Spec Delta

## ADDED Requirements

### Requirement: Stamina and sprint state remain game-layer authoritative

Babylon Lite SHALL own current/max stamina, movement-mode costs, sprint cadence,
T-tick recovery, clamping, and exhausted movement behavior. React SHALL receive
stamina only through the existing narrow immutable snapshot bridge and SHALL not
own or mutate gameplay stamina or sprint state.

#### Scenario: React renders an authoritative stamina snapshot

- **WHEN** the game starts, movement succeeds, or a T tick occurs
- **THEN** Babylon Lite SHALL publish only the current/max stamina values needed
  by the HUD without exposing mutable player or world state

#### Scenario: UI cannot become a second stamina owner

- **WHEN** React renders or rerenders the Character box
- **THEN** it SHALL derive the meter presentation from the latest snapshot and
  SHALL not calculate movement costs, sprint costs, recovery, or cadence
