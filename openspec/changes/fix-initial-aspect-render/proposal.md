# Proposal

## Why

On a landscape startup, the game first renders with default camera/zoom state and then replays the already-saved settings after controller attachment, visibly moving the player about a quarter-second later. The first visible world frame must use the saved presentation, camera, and zoom state so startup has no corrective redraw.

## What Changes

- Apply the persisted Aspect selection to the document presentation frame before the Babylon Lite canvas is created.
- Start Babylon Lite with the saved zoom and camera mode instead of correcting from defaults after the first world render.
- Make controller restoration of an already-active aspect, camera mode, or zoom a no-op.
- Preserve intentional viewport rebuilding and player re-centering for real Aspect, camera, and zoom changes after startup.
- Add focused automated checks for saved-setting initialization and no-op restoration.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `responsive-ui-layout`: Require the initial game frame to honor persisted presentation, camera, and zoom settings before its first visible world render, without a settings-driven corrective render when those settings are already active.

## Impact

- Affected code: `ascii-rpg/index.html`, `ascii-rpg/src/main.jsx`, `ascii-rpg/src/client/ui-layer-react/App.jsx`, `ascii-rpg/src/client/bridge-layer/game-bridge.js`, and `ascii-rpg/src/client/game-layer-babylon-lite/index.js` as needed.
- Affected verification: focused Node/source tests, production build, and manual startup checks in saved landscape and portrait modes.
- No new dependencies, public APIs, settings keys, or gameplay rules.
