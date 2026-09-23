# Spec Delta

## ADDED Requirements

### Requirement: Damaged interior Overground mountains show transient health bars

A visible interior Overground mountain SHALL show the same renderer-owned,
transient health bar used by damaged enemies and spawners. Its fill SHALL be
proportional to mountain health out of `100`, and each new hit SHALL update its
fill and latest-damage segment and restart the existing visibility timing. The
bar SHALL not occupy a world cell or change gameplay state.

#### Scenario: Damaged mountain shows remaining health
- **WHEN** a visible `100`-health mountain takes damage
- **THEN** a health bar SHALL appear above it with fill proportional to its
  remaining health

#### Scenario: Repeated hits update the bar
- **WHEN** a mountain takes another hit while its bar is visible
- **THEN** the current fill and latest damage segment SHALL update, and the
  normal health-bar visibility interval SHALL restart

#### Scenario: Offscreen mountain health is not rendered
- **WHEN** a damaged mountain is outside the active visible region
- **THEN** its health bar SHALL not be submitted for rendering
