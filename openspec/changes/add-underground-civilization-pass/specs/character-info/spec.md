# Spec Delta

## MODIFIED Requirements

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
