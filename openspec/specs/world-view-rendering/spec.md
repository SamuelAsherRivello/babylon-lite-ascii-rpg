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

Every world-view instance SHALL apply the active realm's authoritative fog discovery state before rendering a world cell. An undiscovered cell SHALL produce no world background, glyph, or glyph-background draw for either the game view or the mini-map view. Discovery SHALL be updated by gameplay state, not by an individual view render. A game-view render pass SHALL also reconcile the presentation slot for every cell in its bounded source rectangle so a prior combined presentation cannot remain visible when that slot now represents an undiscovered cell.

#### Scenario: Both views hide an undiscovered cell

- **WHEN** a world cell is undiscovered in the active realm
- **THEN** neither view SHALL render that cell's world content, and the game view SHALL hide any prior glyph or glyph-background presentation occupying that cell's screen slot

#### Scenario: Both views render a discovered cell

- **WHEN** a world cell is discovered in the active realm
- **THEN** both views may render that cell's world content according to their supplied scale and target parameters

#### Scenario: Rendering does not reveal cells

- **WHEN** either view is rendered repeatedly or with a different crop
- **THEN** the fog discovery state SHALL remain unchanged unless gameplay invokes the shared discovery rule

#### Scenario: Viewport shift reconciles prior slots

- **WHEN** the game view changes its source rectangle after movement and a screen slot now corresponds to an undiscovered cell
- **THEN** the slot SHALL be hidden during that render pass and SHALL NOT retain the glyph or glyph-background presentation previously displayed in that slot

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

#### Scenario: Mini-map GPU light pass is optional
- **WHEN** the GPU light pass is enabled and the mini-map has discovered cells
  with cached torch or player light contributions
- **THEN** the mini-map applies the corresponding additive light samples before
  its marker overlay, while leaving world eligibility and authoritative
  lighting unchanged

#### Scenario: Mini-map markers are optional
- **WHEN** the mini-map enables an overlay pass and the game view does not
- **THEN** markers render only after the mini-map's shared world content and
  do not appear in the game view

### Requirement: Stable world render pass order

The renderer SHALL perform any enabled opaque glyph-background composition before glyph composition, SHALL apply the cell's configured lighting to that combined world-view result, and SHALL perform any enabled overlay after world content. The game view and mini-map SHALL use the same enabled glyph/background visual source, adapted only to their destination scale. When the GPU light pass is enabled, the mini-map SHALL apply the same discovered-cell light samples and additive light color before its marker overlay.

#### Scenario: Combined game and mini-map presentation

- **WHEN** a discovered cell is rendered with Glyph Background enabled
- **THEN** both views use the same opaque background-and-glyph composite, reduced or submitted according to the destination view's scale, before any view-specific overlay

#### Scenario: Mini-map GPU light pass

- **WHEN** the GPU light pass is enabled and a discovered mini-map cell has a cached torch or player light contribution
- **THEN** the mini-map SHALL apply the corresponding additive GPU light-pass sample before drawing markers

#### Scenario: Overlay remains above world content

- **WHEN** an enabled marker or presentation overlay occupies a rendered cell
- **THEN** the combined world background-and-glyph result SHALL be completed before the overlay renders
