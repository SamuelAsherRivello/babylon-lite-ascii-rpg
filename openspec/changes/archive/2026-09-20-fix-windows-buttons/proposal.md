# Proposal

## Why

Clicking any launcher in the lower-left Windows section can freeze the browser immediately, preventing the user from opening, using, or closing the Ascii Settings, Arguments, or Lighting window. This blocks a core UI path and must be fixed as one shared interaction problem rather than treating the three launchers independently.

## What Changes

- Make the Ascii Settings launcher open a usable modal window and close it from its close control and backdrop without freezing the game.
- Make the Arguments launcher open a usable modal window and close it from its close control and backdrop without freezing the game.
- Make the Lighting launcher open a usable non-modal window, preserve its controls and saved position, and close/reopen it reliably.
- Bound or isolate any game-layer, renderer, bridge, tooltip, fullscreen, or React update work triggered by a window-button interaction so the browser main thread remains responsive.
- Add focused interaction coverage that opens and closes each window repeatedly, verifies controls remain usable while open, and confirms the game remains responsive afterward.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `ascii-palette`: The Ascii Settings editor must open and close reliably without freezing and retain its existing editing behavior.
- `draggable-lighting-window`: The Lighting launcher and window must open, remain interactive, close, and reopen without freezing or changing lighting state unexpectedly.
- `responsive-ui-layout`: All three lower-left Windows launchers and their resulting window surfaces must remain visible, hit-testable, and operable across supported viewport modes.
- `game-layer-architecture`: React window actions must remain responsive while the Babylon Lite renderer, bridge, and game loop continue operating; a window action must not recreate or deadlock the game layer.

## Impact

- Affected UI: `ascii-rpg/src/client/ui-layer-react/App.jsx`, `style.css`, and related palette, lighting, tooltip, fullscreen, and toast integration paths.
- Affected game boundary: only the existing React-to-Babylon bridge and renderer scheduling paths that are proven to participate in the freeze.
- Affected tests: mirrored UI/client tests plus a focused browser interaction check for all three launchers and close paths.
- Dependencies: no new client dependency; preserve the existing React, Vite, and Babylon Lite architecture.
