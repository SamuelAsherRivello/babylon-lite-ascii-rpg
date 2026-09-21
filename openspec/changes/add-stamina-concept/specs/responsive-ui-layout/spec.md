# Spec Delta

## ADDED Requirements

### Requirement: Character HUD presents stamina below health

The Character box SHALL display bars in this order: Health, Stamina, Offense,
Defense, and Experience. Stamina SHALL use the existing current/delta/unfilled
three-color treatment, appear directly below Health, and reflect the
authoritative current/max snapshot without numeric text.

#### Scenario: Full stamina presentation

- **WHEN** a new game starts with `50` current stamina out of `50` maximum
- **THEN** the Stamina bar SHALL be visible directly below Health and display a
  full current fill using the stamina bar's distinct accent color

#### Scenario: Stamina transition presentation

- **WHEN** movement or a T tick changes stamina
- **THEN** the Stamina bar SHALL use the existing delta transition behavior and
  settle at the corresponding current/max fill ratio

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
