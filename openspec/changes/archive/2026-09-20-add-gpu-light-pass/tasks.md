# Tasks

## 1. Persisted setting and narrow bridge

- [x] 1.1 Add the default-off `Lighting GPU Light Pass` checkbox, local-storage key, reset behavior, accessible label, and short setting explanation in the React Settings UI; verify a focused UI test covers default, toggle, persistence, and reset semantics.
- [x] 1.2 Add a cached boolean GPU-light-pass snapshot and forwarding command to `game-bridge.js`; verify its focused bridge test proves the latest boolean reaches a newly registered controller without exposing renderer state.

## 2. Game-layer GPU light pass

- [x] 2.1 Add a game-layer-owned GPU-light-pass controller that turns the persisted bridge command into an enabled/disabled render mode; verify focused client tests cover the direct sprite-only off path and the immediate mode change.
- [x] 2.2 Build a screen-aligned low-resolution warm emission mask from the existing visible torch/player contribution fields; verify focused lighting/render tests cover source contribution, terrain-shadow exclusion, viewport alignment, and no mutation of world or palette data.
- [x] 2.3 Render the enabled sprite scene through a Babylon Lite additive sprite layer using a generated pre-blurred light atlas, then present the restrained warm composite; verify the layer is resized for visible-region capacity and disposed with the game layer.
- [x] 2.4 Refresh the GPU light-pass inputs on movement, zoom, resize, palette edits, and lighting profile changes; verify focused client tests prove no former-player light trail and correctly updated visible-region alignment.

## 3. Integrated validation

- [x] 3.1 Run `npm.cmd test` and `npm.cmd run build` from the repository root; verify both complete successfully.
- [x] 3.2 Manually verify the live Vite game at `http://127.0.0.1:5173/babylon-lite-ascii-rpg/`: unchecked is the existing sprite-only presentation, checked shows a restrained warm soft composite that follows movement and respects shadows, reload restores the choice, and Reset Settings returns it to unchecked.
