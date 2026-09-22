# Proposal

## Why

The current palette/grid lighting is intentionally deterministic and readable,
but it produces only per-glyph brightness. A selectable GPU light pass will add
soft, warm additive light pools without changing the game's movement,
visibility, terrain, or authoritative grid-shadow rules.

## What Changes

- Add a persisted `Lighting GPU Light Pass` checkbox to Settings, disabled by default.
- When enabled, have the Babylon Lite game layer draw a visual-only GPU
  composite after the existing ASCII sprite render. The pass will use the
  existing visible torch/player light field to make softly blurred, warm
  additive light pools and preserve terrain shadow boundaries.
- Keep the existing palette/grid lighting active in both modes. The new pass
  changes presentation only; it must not alter glyph data, palette entries,
  world generation, collision, movement, or lighting-source/shadow settings.
- Rebuild or update the visual pass when visible lighting inputs change, and
  dispose its GPU resources with the game layer. Turning the checkbox off must
  remove the composite immediately and restore the current sprite-only render.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `palette-grid-lighting`: add the persisted GPU-light-pass setting and define
  its visual-only rendering, toggle, and fallback behavior.
- `game-layer-architecture`: keep the new renderer state and GPU resources
  owned by the Babylon Lite layer, with React communicating only through the
  narrow bridge.

## Impact

- Affected source: React Settings and local-storage handling, the UI-to-game
  bridge, Babylon Lite startup/render/disposal code, and focused lighting/
  bridge/UI tests.
- Affected client: the existing WebGPU-only Babylon Lite canvas. No new
  package or browser-rendering fallback is proposed.
- Acceptance: the default remains the current sprite-only appearance; the
  checked state survives reload and adds a clearly visible soft warm lighting
  composite while retaining the existing deterministic grid shadows.
