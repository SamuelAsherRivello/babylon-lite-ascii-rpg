# Proposal

## Why

Browser Ctrl+mouse-wheel zoom currently changes the effective presentation of both the Babylon Lite game layer and the React HUD. This makes the game world appear to zoom or resize when the user is trying to adjust browser/UI readability. The game presentation should retain its 100% apparent scale while React-owned controls remain responsive to the browser zoom level.

## What Changes

- Detect browser page-zoom changes using the existing browser-zoom and device-pixel-ratio observation path.
- Keep the Babylon game presentation visually compensated to its 100% browser-scale geometry while the browser zoom changes.
- Allow the React `ui_layer` and its responsive controls to continue using the browser’s zoomed CSS viewport.
- Preserve the existing in-game ten-level zoom control as an independent gameplay/rendering setting.
- Preserve pointer, keyboard, swipe, aspect-mode, fullscreen, portrait-frame, transition, minimap, and HUD behavior.
- Add focused automated/source-contract coverage and manual Chrome checks for browser zoom at 80%, 100%, and 125%.

## Capabilities

### New Capabilities

- `browser-zoom-layer-separation`: Defines independent browser-zoom behavior for the React UI layer and Babylon Lite game presentation.

### Modified Capabilities

None. The browser-zoom layer separation is captured as a new capability; existing layer ownership and responsive-layout requirements remain otherwise unchanged.

## Impact

- Likely game-layer presentation sizing/resize handling in `ascii-rpg/src/client/game-layer-babylon-lite/index.js`.
- Layer presentation CSS in `ascii-rpg/src/client/ui-layer-react/map.css` and/or shared layout styles.
- Pointer-coordinate conversion and resize tests in the mirrored `ascii-rpg/test/` tree.
- No new runtime dependencies, renderer replacement, or bridge exposure of world data is expected.
- Manual browser verification is required because Chrome page zoom, CSS layout, device-pixel-ratio changes, and pointer geometry must be checked together.
