# Spec Delta

## ADDED Requirements

### Requirement: Stamina and sprint state remain game-layer authoritative

Babylon Lite SHALL own current/max stamina, enemy-attack costs, sprint cadence,
movement-tick recovery, clamping, and exhausted movement behavior. React SHALL receive
stamina only through the existing narrow immutable snapshot bridge. The bridge
MAY include immutable previous-value and revision metadata needed to visualize
a transient delta, but React SHALL not own or mutate gameplay stamina or sprint
state.

#### Scenario: React renders an authoritative stamina snapshot

- **WHEN** the game starts, movement succeeds, or a T tick occurs
- **THEN** Babylon Lite SHALL publish current/max stamina and immutable
  transition metadata needed by the HUD without exposing mutable player or
  world state

#### Scenario: UI cannot become a second stamina owner

- **WHEN** React renders or rerenders the Character box
- **THEN** it SHALL derive the meter presentation from the latest snapshot and
  SHALL not calculate attack costs, recovery, or cadence
