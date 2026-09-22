# Proposal

## Why

Players can see the active world and realm floor, and fog-of-war already tracks realm-local visibility, but the HUD does not expose exploration progress. Showing discovered coverage makes realm exploration legible and gives the player a simple progress signal tied to unfogged walkable tiles.

## What Changes

- Update the upper-right world status text to display `World: 1 Realm: 1 (N%)` in Overground and `World: 1 Realm: -1 (N%)` in Underground.
- Calculate `Discovered` independently for the active realm.
- Define discovered percentage as the share of that realm's walkable tiles whose fog visibility is greater than `0`.
- Keep realm fog records isolated so changing realms swaps to that realm's own discovered percentage.
- Publish the discovery percentage through the existing narrow game-to-React bridge rather than letting React inspect game internals.
- No dependency changes.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `fog-of-war-minimap`: Add a realm-local walkable discovery percentage derived from per-cell fog visibility.
- `world-realms`: Update the active world/realm HUD contract to include the requested full labels and the active realm's discovered percentage.

## Impact

- Affected client systems: `ascii-rpg/src/client/game-layer-babylon-lite/systems/fog-of-war-system.js`, `ascii-rpg/src/client/game-layer-babylon-lite/index.js`, `ascii-rpg/src/client/bridge-layer/game-bridge.js`, and `ascii-rpg/src/client/ui-layer-react/App.jsx`.
- Affected tests: focused Node/source tests in `ascii-rpg/test/main_tests.mjs` and fog/realm system tests under `ascii-rpg/test/client/game-layer-babylon-lite/systems/`.
- Affected user behavior: the minimap status becomes a concise exploration readout for the current realm while preserving existing fog discovery, minimap rendering, and realm transfer behavior.
