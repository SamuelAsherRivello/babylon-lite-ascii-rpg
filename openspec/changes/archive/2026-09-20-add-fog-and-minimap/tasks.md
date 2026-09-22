# Tasks

## 1. Fog-of-war domain and coverage model

- [x] 1.1 Add a Babylon Lite fog-of-war system with a session-owned discovered-cell field, a named player-light falloff cutoff, hard line-of-sight evaluation, and 10 by 10 walkable/discovered fog-opacity aggregation; verify focused Node tests cover new-world reset, current-cell discovery, clear paths, blockers, unwalkable cells, profile changes, and opacity ratios.
- [x] 1.2 Connect fog initialization to completed world generation and discovery refresh to successful player placement, movement, and player-light profile updates; verify focused client tests prove torch, ambient, shadow-profile, and minimap-visibility changes do not reveal cells.

## 2. Game-owned minimap presentation

- [x] 2.1 Replace coverage-only minimap drawing with a non-interactive, unlit 1:10 downsampled world-content draw path composited over black using the fog-opacity multiplier; verify focused tests cover zero, partial, and full opacity plus terrain and actor content without lighting or camera data.
- [x] 2.2 Preserve responsive upper-right sizing and resize redraw behavior; verify manual browser checks at desktop landscape and mobile portrait sizes show no page overflow and travel reveals colored world content through fog.

## 3. UI command and HUD placement

- [x] 3.1 Keep the minimap permanently visible without a Settings checkbox or persisted visibility state; verify UI tests cover the removed control and retained minimap surface.
- [x] 3.2 Remove the minimap-visibility bridge command and game-controller setter; verify bridge tests retain zoom forwarding without visibility state.
- [x] 3.3 Move the GitHub link immediately above the lower-left Windows list and remove it from the upper-right HUD; verify the rendered HUD structure and responsive CSS tests preserve the stated order and keep the minimap area available.

## 4. Integrated verification

- [x] 4.1 Run `npm.cmd test` from the repository root and resolve failures attributable to this change.
- [x] 4.2 Run `npm.cmd run build` from the repository root and verify the Vite production build succeeds.
- [x] 4.3 Run `openspec validate add-fog-and-minimap --strict` and verify every change artifact is valid and mutually consistent.
