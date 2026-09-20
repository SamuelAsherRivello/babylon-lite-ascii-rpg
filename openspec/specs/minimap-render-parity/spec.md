# minimap-render-parity Specification

## Purpose
Ensures the exploration minimap is a faithful miniature of the same world composition shown by the game view, with only zoom, fog, canvas-size, and marker-overlay differences.

## Requirements

### Requirement: Minimap world composition matches the game renderer

The minimap SHALL render every eligible world cell in its selected viewport using the same world glyph identity, rasterized glyph asset, and resolved visual color as the game renderer, rather than selecting one representative glyph from a coarse region or re-rasterizing blurry display text. Minimap view `1` SHALL mirror the current game viewport composition within the fixed minimap canvas; views `5` and `10` SHALL show progressively smaller player-centered crops of that same composition. The renderer SHALL paint world background first, world glyphs second, and markers last. Fog SHALL continue to hide undiscovered cells, and minimap markers SHALL remain the only intentional visual overlay.

#### Scenario: View 1 mirrors the game viewport

- **WHEN** the minimap is at content zoom `1`
- **THEN** its visible terrain, water, walls, and objects SHALL correspond to the same current game viewport composition, scaled into the unchanged minimap canvas

#### Scenario: Matching zooms preserve cell scale

- **WHEN** the game zoom and minimap content zoom have the same value, including both set to `1`
- **THEN** a world cell SHALL occupy the same rendered pixel footprint and glyph scale in both views; the minimap SHALL not enlarge cells solely to fill its fixed canvas, and unused canvas area MAY remain letterboxed or the source MAY be cropped consistently

#### Scenario: Glyphs remain crisp at minimap size

- **WHEN** the minimap renders a glyph at any supported content zoom
- **THEN** it SHALL use the game's rasterized glyph visual with nearest-neighbor-safe scaling and SHALL not use a separately sized canvas text pass that produces blur

#### Scenario: Higher minimap zooms crop the same composition

- **WHEN** the minimap advances to content zoom `5` or `10`
- **THEN** it SHALL show a progressively smaller player-centered crop of the same world-cell graphics without changing the canvas footprint or game zoom

#### Scenario: Render passes preserve marker visibility

- **WHEN** world cells and markers overlap
- **THEN** the background SHALL be painted first, glyphs second, and markers last with player markers remaining topmost

#### Scenario: Fog remains authoritative

- **WHEN** a source world cell is undiscovered
- **THEN** its world background and glyph SHALL remain hidden while discovered cells continue to render
