# world-view-rendering Specification

## Purpose
Provides one bounded, configurable world-view composition contract for the
game view and mini-map view so both present the same authoritative world and
fog state without duplicating view-specific rendering logic.

## Requirements

### Requirement: Shared bounded world composition

The runtime SHALL render a world view from an explicit source world rectangle
and destination rectangle. The composition SHALL include only cells inside the
source rectangle and SHALL resolve the world background and visible glyph for
each eligible cell through the same world-view pipeline for every view.

#### Scenario: Game view renders only its source rectangle
- **WHEN** the game view is given a bounded world rectangle and destination
  bounds
- **THEN** it renders only cells inside that source rectangle into the
  destination bounds and does not submit cells outside either bound

#### Scenario: Mini-map renders a different source rectangle
- **WHEN** the mini-map is given a source rectangle different from the game
  view
- **THEN** it renders its supplied crop through the same world-cell
  composition rules without changing the game view's crop or state

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

### Requirement: Parameterized presentation capabilities

The world-view renderer SHALL accept view parameters that enable or disable
presentation capabilities such as target-layer submission, scale, lighting,
and optional overlays. Capability differences SHALL be expressed through
arguments while world-cell eligibility and glyph identity remain shared.

#### Scenario: Game lighting is view-specific
- **WHEN** the game view enables its lighting parameters and the mini-map
  disables them
- **THEN** both views use the same eligible glyphs while only the game view
  applies its configured lighting presentation

#### Scenario: Mini-map markers are optional
- **WHEN** the mini-map enables an overlay pass and the game view does not
- **THEN** markers render only after the mini-map's shared world content and
  do not appear in the game view

### Requirement: Stable world render pass order

The renderer SHALL perform world background composition before world glyph
composition, and SHALL perform any enabled overlay after both world passes.

#### Scenario: Overlay remains above world content
- **WHEN** an enabled marker or presentation overlay occupies a rendered cell
- **THEN** the world background is composed first, the glyph is composed second,
  and the overlay is composed last
