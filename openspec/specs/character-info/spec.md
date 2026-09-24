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

The panel SHALL render gold as `0` and the player's key count as `0` initially, without visible `Gold`, `Carrying`, or `Keys` text labels. Gold and keys SHALL occupy resource cells in the six-cell 3×2 grid, and the remaining four cells SHALL display Sword, Shield, Pickaxe, and the bomb stack. The fourth inventory cell SHALL display the bomb glyph and current count, initially `50`, and SHALL remain visible at count `0`. The key resource SHALL use the `⚿` glyph and SHALL update whenever Babylon Lite publishes a changed key count through the narrow bridge snapshot. Inventory cells containing Sword, Shield, or Pickaxe SHALL also render that item's current health relative to its maximum health as a compact health bar.

#### Scenario: Initial resources and item health render
- **WHEN** the character panel renders with the default inventory
- **THEN** gold SHALL be `0`, key count SHALL be `0`, Sword/Shield/Pickaxe SHALL each show a full `1000 / 1000` health bar, the bomb stack SHALL show `50`, and carrying text SHALL not be present

#### Scenario: Initial resources render
- **WHEN** the character panel renders with the initial character data
- **THEN** gold SHALL be `0`, key count SHALL be `0`, bomb count SHALL be `50`, and carrying text or carrying values SHALL not be present

#### Scenario: Item health updates after gameplay damage
- **WHEN** Babylon Lite publishes an item-health change
- **THEN** the corresponding inventory cell SHALL update its health bar without React calculating or mutating gameplay state

#### Scenario: Depleted item disappears from its cell
- **WHEN** an equipment item's health reaches zero
- **THEN** its inventory cell SHALL render the existing empty-slot placeholder and SHALL not show a positive health bar

#### Scenario: Resources have no gameplay state yet
- **WHEN** the initial character data is rendered
- **THEN** gold SHALL be `0`, current key count SHALL be `0`, and no carrying state SHALL be exposed

#### Scenario: Key count updates after collection
- **WHEN** the player collects a key and the game layer publishes the new count
- **THEN** the character panel SHALL render the updated key count beside `⚿`

#### Scenario: Key count updates after spending
- **WHEN** the player unlocks a door and the game layer publishes the spent key
- **THEN** the character panel SHALL render the decremented key count

#### Scenario: Bomb count updates after placement
- **WHEN** the game layer publishes a successful bomb placement
- **THEN** the fourth inventory cell SHALL render the decremented bomb count through the character snapshot

#### Scenario: Empty bomb stack remains visible
- **WHEN** the bomb count reaches zero
- **THEN** the fourth inventory cell SHALL continue to show the bomb glyph with count `0`

### Requirement: Health HUD stays normalized to the player's maximum health

The game layer SHALL publish player health to the existing HUD as a percentage from `0` through `100`, calculated from current health divided by maximum health. React SHALL continue to consume the normalized snapshot and SHALL NOT calculate or mutate player health.

#### Scenario: Raised maximum health still displays as full
- **WHEN** a new player has `125 / 125` health
- **THEN** the health HUD SHALL display `100%`

#### Scenario: Bomb damage displays the remaining health percentage
- **WHEN** a player without Defense receives one bomb hit and has `25 / 125` health remaining
- **THEN** the health HUD SHALL display `20%`

### Requirement: Character icons are glyph-only

The six panel icons SHALL be represented by text glyphs in the document and
SHALL NOT depend on PNG, SVG, canvas drawings, or other static image assets.

#### Scenario: Glyph icons render without asset loading

- **WHEN** the character panel is rendered without additional assets
- **THEN** health, offense, defense, experience, gold, and carrying each show
  a distinct text glyph
