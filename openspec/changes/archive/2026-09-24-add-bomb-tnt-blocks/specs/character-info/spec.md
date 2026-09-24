# Spec Delta

## MODIFIED Requirements

### Requirement: Character resource values render

The panel SHALL render gold as `0` and the player's key count as `0` initially, without visible `Gold`, `Carrying`, or `Keys` text labels. Gold and keys SHALL occupy resource cells in the six-cell 3×2 grid, and the remaining four cells SHALL display Sword, Shield, Pickaxe, and the bomb stack. The bomb stack SHALL appear in the fourth inventory cell with a glyph and its current count, initially `50`. The key resource SHALL use the `⚿` glyph and SHALL update whenever Babylon Lite publishes a changed key count through the narrow bridge snapshot. Inventory cells containing Sword, Shield, or Pickaxe SHALL also render that item's current health relative to its maximum health.

#### Scenario: Initial resources and item health render
- **WHEN** the character panel renders with the default inventory
- **THEN** gold SHALL be `0`, key count SHALL be `0`, Sword/Shield/Pickaxe SHALL each show a full `1000 / 1000` health bar, the bomb stack SHALL show `50`, and carrying text SHALL not be present

#### Scenario: Initial resources render
- **WHEN** the character panel renders with the initial character data
- **THEN** gold SHALL be `0`, key count SHALL be `0`, the bomb stack SHALL show `50`, and carrying text or carrying values SHALL not be present

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

## ADDED Requirements

### Requirement: Health HUD stays normalized to the player's maximum health

The game layer SHALL publish player health to the existing HUD as a percentage from `0` through `100`, calculated from current health divided by maximum health. React SHALL continue to consume the normalized snapshot and SHALL NOT calculate or mutate player health.

#### Scenario: Raised maximum health still displays as full
- **WHEN** a new player has `125 / 125` health
- **THEN** the health HUD SHALL display `100%`

#### Scenario: Bomb damage displays the remaining health percentage
- **WHEN** a player without Defense receives one bomb hit and has `25 / 125` health remaining
- **THEN** the health HUD SHALL display `20%`
