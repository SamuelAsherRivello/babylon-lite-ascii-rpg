# Spec Delta

## MODIFIED Requirements

### Requirement: UI bar rows render character stats

The panel SHALL render health, offense, defense, and experience using the same UI bar component contract. Each UI bar SHALL contain a glyph icon, an unfilled dark section, a current-value section, and a pending-change section; the bar SHALL expose its current percentage to assistive technology. The four stat rows SHALL NOT render text labels beside their icons and bars. Each bar SHALL accept a base color, use that color for its current section, lighten it for the pending-change section, and darken it toward but not all the way to black for the unfilled section.

#### Scenario: Initial stat bars use the character model
- **WHEN** the initial character data is rendered
- **THEN** health is 100%, offense is 10%, defense is 10%, and experience is 0%

#### Scenario: Bar colors derive from each stat color
- **WHEN** a UI bar receives a base color
- **THEN** its current fill uses the base color, its delta fill is a lighter derived color, and its unfilled section is a darker derived color that is visibly above pure black

#### Scenario: Experience bar shows the starting ordinal
- **WHEN** the experience bar renders at the initial state
- **THEN** the bar displays `O1` and the data includes zero current points and the points required for the next level

#### Scenario: Enemy damage updates HUD health
- **WHEN** an enemy attack changes the authoritative player health
- **THEN** the health bar SHALL render the resulting percentage through the existing immutable health snapshot

