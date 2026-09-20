# minimap-render-parity Specification

## Purpose
Ensures the exploration minimap is a faithful miniature of the same world composition shown by the game view, with only zoom, fog, canvas-size, and marker-overlay differences.

## Requirements

### Requirement: Minimap world composition matches the game renderer

The mini-map SHALL render every eligible world cell in its explicitly supplied
source viewport using the same world glyph identity, rasterized glyph asset,
and resolved base visual color as the game renderer. The mini-map source
viewport MAY differ from the game view source viewport, but both SHALL use the
shared world-view composition and the active realm's authoritative fog state.
The mini-map SHALL preserve its own scale and canvas bounds, SHALL paint world
background before world glyphs, and SHALL paint optional mini-map markers last.

#### Scenario: Explicit mini-map crop

- **WHEN** the mini-map receives a source rectangle and destination bounds
- **THEN** its terrain, water, walls, and objects SHALL correspond to the
  eligible cells in that supplied crop without rendering outside it

#### Scenario: View 1 mirrors the game viewport

- **WHEN** the mini-map receives a source rectangle matching the current game
  view at content scale `1`
- **THEN** its visible terrain, water, walls, and objects SHALL correspond to
  the same eligible game-view composition within the mini-map canvas

#### Scenario: Matching source crops preserve cell scale

- **WHEN** the game view and mini-map receive the same source rectangle and
  compatible content scale
- **THEN** a world cell SHALL retain the same logical rendered footprint and
  glyph scale in both views, subject to their destination bounds

#### Scenario: Matching source crops preserve composition

- **WHEN** the game view and mini-map receive the same source rectangle and
  compatible scale
- **THEN** their eligible world cells and glyph identities SHALL correspond,
  subject only to target-specific rasterization and presentation effects

#### Scenario: Different source crops remain independent

- **WHEN** the mini-map receives a crop different from the game view
- **THEN** changing the mini-map crop SHALL not change the game view crop,
  player position, camera state, or fog discovery state

#### Scenario: Higher mini-map zooms crop the same composition

- **WHEN** the mini-map receives a higher content scale with a smaller
  player-centered source rectangle
- **THEN** it SHALL show a progressively smaller crop of the same shared
  world-cell composition without changing the game view's crop or zoom

#### Scenario: Glyphs remain crisp at mini-map size

- **WHEN** the mini-map renders a glyph at any supported content scale
- **THEN** it SHALL use the shared rasterized glyph visual with
  nearest-neighbor-safe scaling and SHALL not use a separately sized text pass
  that produces blur

#### Scenario: Fog remains authoritative in both views

- **WHEN** a source world cell is undiscovered
- **THEN** its world background and glyph SHALL remain hidden in both the game
  view and mini-map view while discovered cells continue to render

#### Scenario: Fog remains authoritative

- **WHEN** a source world cell is undiscovered
- **THEN** its world background and glyph SHALL remain hidden in the mini-map
  and game view while discovered cells continue to render

#### Scenario: Matching zooms preserve cell scale

- **WHEN** the game view and mini-map receive matching source rectangles and
  content scales
- **THEN** a world cell SHALL occupy the corresponding logical rendered
  footprint and glyph scale in both views, subject to destination bounds

#### Scenario: Glyphs remain crisp at minimap size

- **WHEN** the mini-map renders a glyph at any supported content scale
- **THEN** it SHALL use the shared rasterized glyph visual with
  nearest-neighbor-safe scaling and SHALL not use a separately sized text pass
  that produces blur

#### Scenario: Higher minimap zooms crop the same composition

- **WHEN** the mini-map receives a higher content scale with a smaller
  player-centered source rectangle
- **THEN** it SHALL show a progressively smaller crop of the same shared
  world-cell composition without changing the game view's crop or zoom

#### Scenario: Render passes preserve marker visibility

- **WHEN** world cells and mini-map markers overlap
- **THEN** the shared world background SHALL be painted first, world glyphs
  second, and enabled markers last with player markers remaining topmost
