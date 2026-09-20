# character-info Specification

## Purpose
Provides a compact, glyph-based character information panel that establishes
the initial character-state and reusable UI-bar contract for the RPG HUD.

## Requirements

### Requirement: Character panel fits the upper-left HUD box

The HUD SHALL render a `Character` action label inside the upper-left
character box, and the box SHALL have the same square dimensions as the
minimap box at every supported viewport size.

#### Scenario: Character panel is visible in the initial HUD

- **WHEN** the game UI loads with the HUD enabled
- **THEN** the upper-left box shows the `Character` label and the initial
  character readout without requiring a game action

#### Scenario: Character box remains minimap-sized

- **WHEN** the browser is resized across desktop, portrait, or constrained
  landscape layouts
- **THEN** the character box remains the minimap box's square size and its
  contents remain contained within that box

### Requirement: UI bar rows render character stats

The panel SHALL render health, offense, defense, and experience using the same
UI bar component contract. Each UI bar SHALL contain a glyph icon, an unfilled
dark section, a current-value section, and a pending-change section; the bar
SHALL expose its current percentage to assistive technology. The four stat
rows SHALL NOT render text labels beside their icons and bars.
Each bar SHALL accept a base color, use that color for its current section,
lighten it for the pending-change section, and darken it toward but not all the
way to black for the unfilled section.

#### Scenario: Initial stat bars use the character model

- **WHEN** the initial character data is rendered
- **THEN** health is 80%, offense is 10%, defense is 10%, and experience is
  0%

#### Scenario: Bar colors derive from each stat color

- **WHEN** a UI bar receives a base color
- **THEN** its current fill uses the base color, its delta fill is a lighter
  derived color, and its unfilled section is a darker derived color that is
  visibly above pure black

#### Scenario: Experience bar shows the starting ordinal

- **WHEN** the experience bar renders at the initial state
- **THEN** the bar displays `O1` and the data includes zero current points and
  the points required for the next level

### Requirement: Character resource values render

The panel SHALL render gold as `0` and carrying weight as `0/0`, where the
first carrying value is current weight and the second is capacity, without
visible `Gold` or `Carrying` text labels. These two resources SHALL occupy the
left two cells of a six-cell 3×2 grid, and the remaining four cells SHALL show
empty `Slot 01` through `Slot 04` placeholders.

#### Scenario: Resources have no gameplay state yet

- **WHEN** the initial character data is rendered
- **THEN** gold is `0`, current carrying weight is `0`, and carrying capacity
  is `0`

### Requirement: Character icons are glyph-only

The six panel icons SHALL be represented by text glyphs in the document and
SHALL NOT depend on PNG, SVG, canvas drawings, or other static image assets.

#### Scenario: Glyph icons render without asset loading

- **WHEN** the character panel is rendered without additional assets
- **THEN** health, offense, defense, experience, gold, and carrying each show
  a distinct text glyph
