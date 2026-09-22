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

### Requirement: Character resource values render

The panel SHALL render gold as `0` and the player's key count as `0` initially,
without visible `Gold`, `Carrying`, or `Keys` text labels. Gold and keys SHALL
occupy resource cells in the six-cell 3×2 grid, and the remaining cells SHALL
show empty `Slot 01` through `Slot 04` placeholders. The key resource SHALL
use the `⚿` glyph and SHALL update whenever Babylon Lite publishes a changed
key count through the narrow bridge snapshot.

#### Scenario: Initial resources render
- **WHEN** the initial character data is rendered
- **THEN** gold SHALL be `0`, key count SHALL be `0`, and carrying text or
  carrying values SHALL not be present

#### Scenario: Resources have no gameplay state yet
- **WHEN** the initial character data is rendered
- **THEN** gold SHALL be `0`, current key count SHALL be `0`, and no carrying
  state SHALL be exposed

#### Scenario: Key count updates after collection
- **WHEN** the player collects a key and the game layer publishes the new count
- **THEN** the character panel SHALL render the updated key count beside `⚿`

#### Scenario: Key count updates after spending
- **WHEN** the player unlocks a door and the game layer publishes the spent key
- **THEN** the character panel SHALL render the decremented key count

### Requirement: Character icons are glyph-only

The six panel icons SHALL be represented by text glyphs in the document and
SHALL NOT depend on PNG, SVG, canvas drawings, or other static image assets.

#### Scenario: Glyph icons render without asset loading

- **WHEN** the character panel is rendered without additional assets
- **THEN** health, offense, defense, experience, gold, and carrying each show
  a distinct text glyph
