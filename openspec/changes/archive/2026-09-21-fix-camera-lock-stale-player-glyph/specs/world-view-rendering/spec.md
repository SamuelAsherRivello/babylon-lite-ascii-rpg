# Spec Delta

## MODIFIED Requirements

### Requirement: Shared fog eligibility

Every world-view instance SHALL apply the active realm's authoritative fog
discovery state before rendering a world cell. An undiscovered cell SHALL
produce no world background or glyph draw for either the game view or the
mini-map view. Discovery SHALL be updated by gameplay state, not by an
individual view render. A game-view render pass SHALL also reconcile the
presentation slot for every cell in its bounded source rectangle so a prior
glyph cannot remain visible when that slot now represents an undiscovered cell.

#### Scenario: Both views hide an undiscovered cell

- **WHEN** a world cell is undiscovered in the active realm
- **THEN** neither view SHALL render that cell's world content, and the game
  view SHALL hide any prior presentation occupying that cell's screen slot

#### Scenario: Both views render a discovered cell

- **WHEN** a world cell is discovered in the active realm
- **THEN** both views may render that cell's world content according to their
  supplied scale and target parameters

#### Scenario: Rendering does not reveal cells

- **WHEN** either view is rendered repeatedly or with a different crop
- **THEN** the fog discovery state SHALL remain unchanged unless gameplay
  invokes the shared discovery rule

#### Scenario: Viewport shift reconciles prior slots

- **WHEN** the game view changes its source rectangle after movement and a
  screen slot now corresponds to an undiscovered cell
- **THEN** the slot SHALL be hidden during that render pass and SHALL NOT retain
  the glyph previously displayed in that slot
