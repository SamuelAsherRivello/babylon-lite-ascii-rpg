# Proposal

## Why

The ASCII game view currently renders glyphs directly against the canvas, which can make cell boundaries difficult to read across terrain, lighting, and zoom levels. A persisted glyph-background option will provide a configurable grid treatment while preserving the current fog and lighting rules.

## What Changes

- Add a `Layout` tab at the top of the `Ascii Settings` window.
- Add a `Glyph Background` On/Off control, defaulting to `On`.
- Add a `Background Darkness` integer slider from `0` to `100`, defaulting to `50`.
- Persist both settings in browser `localStorage`, initialize missing values with their defaults, and restore those defaults after `Reset Settings` clears storage.
- For every discovered rendered cell, including cells whose glyph is a space, create an opaque grid-sized background from the glyph palette color before lighting is applied.
- Compute the background color by darkening the glyph color toward black according to the slider: `0` keeps the color unchanged, `50` halves each RGB channel, and `100` produces black.
- Composite the background and glyph into one cell result, then apply the cell's existing lighting once to that combined result.
- Use the same composite presentation in the game world and mini-map, adapting only to each view's scale.
- When the GPU light pass is enabled, apply its shared discovered-cell light samples and additive light color to the mini-map before markers.
- Do not render either the background or glyph for fogged/undiscovered cells, and preserve current rendering when `Glyph Background` is `Off`.

## Capabilities

### New Capabilities

- `glyph-background-layout`: Provides the Layout settings controls, persistence, darkness mapping, and configurable opaque glyph backgrounds.

### Modified Capabilities

- `world-view-rendering`: Require discovered-cell background/glyph composition and retain the existing fog eligibility and render ordering.
- `palette-grid-lighting`: Apply cell lighting after the glyph/background composite rather than treating the background as an independently lit layer.

## Impact

- Affected React UI: `ascii-rpg/src/runtime/ui-layer-react/App.jsx` and `windows.css`.
- Affected bridge/controller state: the UI-to-game rendering preference path and runtime redraw invalidation.
- Affected game rendering: `ascii-rpg/src/runtime/game-layer-babylon-lite/glyph-visual-cache.js`, `index.js`, GPU light-pass helpers, and related rendering helpers/tests.
- Affected browser persistence: two new local-storage preferences cleared by the existing Reset Settings behavior.
- No new dependencies, public APIs, world data, fog state, palette entries, or gameplay mechanics.
