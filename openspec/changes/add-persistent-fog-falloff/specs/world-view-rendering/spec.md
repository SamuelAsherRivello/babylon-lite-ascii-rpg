# Spec Delta

## MODIFIED Requirements

### Requirement: Shared fog eligibility

Every world-view instance SHALL apply the active realm's authoritative
per-cell fog visibility before rendering a world cell. A cell at `0` visibility
SHALL produce no world background, glyph, or glyph-background draw for either
the game view or the mini-map view. A cell with visibility above `0` SHALL
render its world content with opacity equal to its visibility divided by `100`.
Discovery SHALL be updated by gameplay state, not by an individual view
render. A game-view render pass SHALL reconcile the presentation slot for
every cell in its bounded source rectangle so a prior presentation cannot
remain visible when that slot now represents a `0`-visibility cell.

#### Scenario: Both views hide a fully fogged cell

- **WHEN** a world cell has `0` visibility in the active realm
- **THEN** neither view renders that cell's world content, and the game view
  hides any prior glyph or glyph-background presentation occupying that slot

#### Scenario: Both views hide an undiscovered cell

- **WHEN** a world cell is undiscovered in the active realm
- **THEN** neither view renders that cell's world content, and the game view
  hides any prior glyph or glyph-background presentation occupying that cell's
  screen slot

#### Scenario: Both views render partial visibility

- **WHEN** a world cell has `25`, `50`, or `75` visibility
- **THEN** both views render the cell's world content with the corresponding
  `25%`, `50%`, or `75%` opacity

#### Scenario: Fully visible cell renders normally

- **WHEN** a world cell has `100` visibility
- **THEN** both views may render the cell's world content at full opacity

#### Scenario: Both views render a discovered cell

- **WHEN** a world cell has positive visibility in the active realm
- **THEN** both views may render that cell's world content according to their
  supplied scale and target parameters

#### Scenario: Rendering does not reveal cells

- **WHEN** either view is rendered repeatedly or with a different crop
- **THEN** the fog visibility state remains unchanged unless gameplay invokes
  the shared discovery rule

#### Scenario: Viewport shift reconciles prior slots

- **WHEN** the game view changes its source rectangle and a screen slot now
  corresponds to a `0`-visibility cell
- **THEN** the slot is hidden during that render pass and does not retain the
  prior glyph or glyph-background presentation
