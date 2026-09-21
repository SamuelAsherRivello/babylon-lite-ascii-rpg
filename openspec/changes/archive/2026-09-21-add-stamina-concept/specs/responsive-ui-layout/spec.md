# Spec Delta

## ADDED Requirements

### Requirement: Character HUD presents stamina below health

The Character box SHALL display bars in this order: Health, Stamina, Offense,
Defense, and Experience. Every bar SHALL derive a solid current shade, a
lighter temporary delta shade, and a dark unfilled shade from that bar's
configured target color. Bars SHALL render normalized `0`-to-`100` percentages
supplied by the owning resource model and SHALL NOT infer those percentages
from nominal values. Stamina SHALL appear directly below Health and reflect the
authoritative gameplay snapshot without numeric text.

#### Scenario: Full stamina presentation

- **WHEN** a new game starts with `50` current stamina out of `50` maximum
- **THEN** the Stamina bar SHALL be visible directly below Health and display
  `50` units of solid orange current fill followed by `50` units of dark orange
  unfilled capacity

#### Scenario: Stamina transition presentation

- **WHEN** movement or a T tick changes stamina
- **THEN** the interval between the previous and next visual values SHALL
  temporarily use the delta shade before settling into the current or unfilled
  shade, while accessibility continues to expose gameplay current/max

#### Scenario: Every bar derives three shades from its target color

- **WHEN** any Character bar renders or changes value
- **THEN** its current, temporary delta, and unfilled sections SHALL be derived
  from that bar's configured target color rather than shared fixed colors

#### Scenario: Different nominal scales share the percentage bar

- **WHEN** two resources use different nominal values for their full or partial
  states
- **THEN** each owning resource model SHALL supply normalized percentages and
  the generic bar SHALL render those percentages without interpreting the
  nominal values

#### Scenario: HUD remains usable in portrait

- **WHEN** the game is shown in a supported portrait or mobile-sized viewport
- **THEN** all five bars SHALL remain visible without clipping or overflow

### Requirement: Character resource slots make room for the fifth bar

The Character resource and slot boxes SHALL use a hardcoded `22.4px` square
size, reduced from the existing `28px` size, so the new Stamina bar has room
without displacing controls outside the Character box.

#### Scenario: Reduced slot geometry

- **WHEN** the Character box renders with the five-bar layout
- **THEN** each resource or slot box SHALL use the `22.4px` square geometry and
  remain aligned within the responsive Character box
