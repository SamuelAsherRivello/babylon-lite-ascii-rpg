# Spec Delta

## MODIFIED Requirements

### Requirement: Character resource values render

The panel SHALL render Gold as `0` and the player's Key count as `0` initially, without visible `Gold`, `Carrying`, or `Keys` text labels. Gold and Keys SHALL occupy resource cells in the six-cell 3×2 grid. Slot 01 SHALL render `🗡` Sword, Slot 02 SHALL render `🛡` Shield, Slot 03 SHALL render `⛏` Pickaxe, and Slot 04 SHALL render an empty `Slot 04` placeholder for the initial character state. The Key resource SHALL use the `⚿` glyph and SHALL update whenever Babylon Lite publishes a changed key count through the narrow bridge snapshot.

#### Scenario: Initial resources and equipment render

- **WHEN** the initial character data is rendered
- **THEN** Gold is `0`, Key count is `0`, Slots 01–03 show Sword, Shield, and Pickaxe glyphs, and Slot 04 remains empty

#### Scenario: Resources retain their distinct role

- **WHEN** the initial character data is rendered
- **THEN** Gold and Keys remain resource cells and are not rendered as equipment slots

#### Scenario: Key count updates after collection

- **WHEN** the player collects a key and the game layer publishes the new count
- **THEN** the character panel renders the updated count beside `⚿`

#### Scenario: Key count updates after spending

- **WHEN** the player unlocks a door and the game layer publishes the spent key
- **THEN** the character panel renders the decremented count beside `⚿`

### Requirement: Character icons are glyph-only

The six panel cells SHALL represent Gold, Keys, and equipment using text glyphs in the document and SHALL NOT depend on PNG, SVG, canvas drawings, or other static image assets.

#### Scenario: Equipment glyphs render without asset loading

- **WHEN** the Character panel is rendered without additional assets
- **THEN** Sword, Shield, Pickaxe, Gold, and Keys each render as text glyphs
