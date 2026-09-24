# Spec Delta

## MODIFIED Requirements

### Requirement: Character resource values render

The panel SHALL render gold as `0` and the player's key count as `0` initially, without visible `Gold`, `Carrying`, or `Keys` text labels. Gold and keys SHALL occupy resource cells in the six-cell 3×2 grid, and the remaining cells SHALL show empty `Slot 01` through `Slot 04` placeholders. The key resource SHALL use the `⚿` glyph and SHALL update whenever Babylon Lite publishes a changed key count through the narrow bridge snapshot. Inventory cells containing Sword, Shield, or Pickaxe SHALL also render that item's current health relative to its maximum health as a compact health bar.

#### Scenario: Initial resources and item health render
- **WHEN** the character panel renders with the default inventory
- **THEN** gold SHALL be `0`, key count SHALL be `0`, Sword/Shield/Pickaxe SHALL each show a full `1000 / 1000` health bar, and carrying text SHALL not be present

#### Scenario: Initial resources render
- **WHEN** the character panel renders with the initial character data
- **THEN** gold SHALL be `0`, key count SHALL be `0`, and carrying text or carrying values SHALL not be present

#### Scenario: Item health updates after gameplay damage
- **WHEN** Babylon Lite publishes an item-health change
- **THEN** the corresponding inventory cell SHALL update its health bar without React calculating or mutating gameplay state

#### Scenario: Depleted item disappears from its cell
- **WHEN** an item's health reaches zero
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
