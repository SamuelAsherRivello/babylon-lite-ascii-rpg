# Tasks

## 1. Marker derivation

- [x] 1.1 Add a minimap-renderer helper that maps the player-start, current-player, and torch world cells to the existing coarse minimap grid; include only torches whose exact cells are discovered, and verify focused minimap-renderer tests cover coordinates and fog eligibility.
- [x] 1.2 Define the fixed depth contract: black base 0, world content 10, green origin 20, white torch 30, and yellow player 40; verify focused tests cover yellow as the visible final color over both start and torch markers.

## 2. Minimap composition

- [x] 2.1 Update the Babylon Lite minimap draw path to paint the derived markers after its fog-masked world-content pass at full alpha, and verify the game-layer source contract preserves fog rendering and includes the marker pass.
- [x] 2.2 Ensure minimap refreshes after initial world setup, player movement, and discovery updates continue to reflect the current player and newly discovered torches; verify the existing Node minimap and fog test paths pass.

## 3. Verification

- [x] 3.1 Run `npm.cmd test` and verify the full Node suite passes, including minimap marker behavior.
- [x] 3.2 Run `npm.cmd run build` and verify the Vite production build succeeds.
