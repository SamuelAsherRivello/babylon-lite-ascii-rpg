# Proposal

## Why

The current torches are visible landmarks but do not affect the flat ASCII
scene. Scheme A provides a low-cost lighting experiment that matches the
top-down grid: each torch contributes a circular light field by grid distance,
with no occlusion or Babylon light objects. This lets the game evaluate the
visual language before investing in shadow-casting 3D lighting.

## What Changes

- Add palette/grid lighting for the visible ASCII cells.
- Compute a light intensity for each cell from torch row/column positions, a
  configurable grid radius, and a configurable falloff curve.
- Add a level-wide ambient-light setting from 0 to 1, where 0 is no ambient
  light and 1 fully lights the scene, defaulting to `0.6` after storage reset.
- Combine ambient light with independent torch and player source profiles.
- Expose `Lighting Torch` and `Lighting Player` controls, each cycling through
  `Off`, `Low`, `Med`, and `High`.
- Add a `Light Ambient + <value> -` control above Zoom, with bounded adjustment.
- Add a `Reset Settings` control at the bottom of Settings that clears local
  storage and reloads the defaults.
- Apply the factor to rendered palette color and opacity without changing
  terrain, character, movement, or torch placement data.
- Remove user-controlled alpha editing from the Ascii Palette; palette color
  remains editable while runtime lighting owns brightness and opacity.
- Recalculate lighting when the visible region, player movement, viewport,
  zoom, palette, or world changes require rendering updates.
- Keep the experiment shadowless: wall cells do not block or cast shadows, and
  no Babylon `Light`, shadow generator, or lighting dependency is introduced.

## Capabilities

### New Capabilities

- `palette-grid-lighting`: Deterministic, circular, palette-based lighting for
  visible grid cells using torch sources.

### Modified Capabilities

- `game-layer-architecture`: The game layer applies a derived lighting factor
  to visible palette styles while preserving the existing palette bridge.
- `ascii-palette`: Palette color remains editable, but palette alpha is no
  longer user-controlled because runtime lighting owns opacity.
- `random-torch-placement`: Torch positions are consumed as stable light
  sources without changing their placement or movement semantics.

## Impact

- Affected runtime: `ascii-rpg/src/runtime/game-layer-babylon-lite/`,
  especially visible-cell rendering and palette color handling.
- Affected tests: Babylon Lite rendering and lighting unit tests.
- No new dependency is expected. The narrow bridge gains commands for the
  level ambient value and the two source profiles.
- The main tuning decisions are the ambient step and source profile values;
  the design records recommended experiment values rather than final balance.
