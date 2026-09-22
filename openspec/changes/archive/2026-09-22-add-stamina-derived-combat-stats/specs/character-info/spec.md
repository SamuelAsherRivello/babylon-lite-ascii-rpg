# Spec Delta

## MODIFIED Requirements

### Requirement: UI bar rows render character stats

The panel SHALL render health, stamina, offense, defense, and experience using
the same UI bar component contract. Each UI bar SHALL contain a glyph icon, an
unfilled dark section, a current-value section, and a pending-change section;
the bar SHALL expose its current percentage to assistive technology. The five
stat rows SHALL NOT render text labels beside their icons and bars. Each bar
SHALL accept a base color, use that color for its current section, lighten it
for the pending-change section, and darken it toward but not all the way to
black for the unfilled section. Offense and Defense SHALL use their published
current and maximum snapshots, so their visible current fills SHALL fall when
stamina is spent and rise when movement-driven recovery restores stamina.

#### Scenario: Initial stat bars use the character model
- **WHEN** the initial character data is rendered
- **THEN** health SHALL be 100%, stamina SHALL be `50 / 50`, offense SHALL be `25 / 25`, defense SHALL be `25 / 25`, and experience SHALL be 0%

#### Scenario: Combat bars visibly follow stamina
- **WHEN** the player's stamina is 25% of its maximum
- **THEN** the Offense and Defense current fills SHALL each display 25% of their maximum bar capacity

#### Scenario: Combat bars recover after retreat
- **WHEN** movement-driven stamina recovery increases the player's stamina
- **THEN** the Offense and Defense current fills SHALL update to their newly published percentages

#### Scenario: Bar colors derive from each stat color
- **WHEN** a UI bar receives a base color
- **THEN** its current fill SHALL use the base color, its delta fill SHALL use a lighter derived color, and its unfilled section SHALL use a darker derived color that is visibly above pure black

#### Scenario: Experience bar shows the starting ordinal
- **WHEN** the experience bar renders at the initial state
- **THEN** the bar SHALL display `O1` and the data SHALL include zero current points and the points required for the next level

#### Scenario: Enemy damage updates HUD health
- **WHEN** an enemy attack changes the authoritative player health
- **THEN** the health bar SHALL render the resulting percentage through the existing immutable health snapshot
