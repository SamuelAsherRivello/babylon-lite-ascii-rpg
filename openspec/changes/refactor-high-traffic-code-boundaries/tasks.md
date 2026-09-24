# Tasks

## 1. Establish refactor safeguards

- [x] 1.1 Record deterministic Overworld and Underground generation fixtures, normalized settings snapshots, and current bridge/UI contracts; verify focused existing Node tests pass before moving code.
- [x] 1.2 Identify and preserve the public exports, persisted generation-settings shape, storage key, pass order, and active working-tree ownership; verify no unrelated dirty file is staged or overwritten.

## 2. Create the generation-layers boundary

- [x] 2.1 Create `generation-layers/` and `generation-layer-registry.js` with the existing feature order, realms, dependencies, semantic cards, descriptions, and density policy; verify registry and settings-store focused tests cover the complete catalog.
- [x] 2.2 Extract grid and terrain behavior into `grid-generation-layer.js` and `terrain-generation-layer.js` using explicit context inputs; verify seeded cave/wall fixtures match the baseline.
- [x] 2.3 Extract water and walkability behavior into `water-generation-layer.js` and `walkability-generation-layer.js`; verify deterministic lake depth, walkability, and ordered-pass tests pass.
- [x] 2.4 Extract player placement and static object distribution into `player-start-generation-layer.js` and `object-generation-layer.js`; verify player-start, torch, pickup, and object-spawner tests pass.
- [x] 2.5 Extract civilization and dynamic-entity setup into `civilization-generation-layer.js` and `dynamic-entity-generation-layer.js`; verify paired stairs, doors, NPC, and enemy-spawner ordering tests pass.
- [x] 2.6 Reduce `world-system.js` to stable world-state and public-facade responsibilities; verify all world-system tests and existing imports remain valid.

## 3. Consolidate settings ownership

- [x] 3.1 Route the settings store's descriptions, realms, configurable flags, defaults, and density details through the generation-layer registry; verify default and legacy settings normalization remains unchanged.
- [x] 3.2 Convert `generation-profile.js` into a registry-backed compatibility adapter with no duplicated catalog metadata; verify every Low/Med/High runtime parameter matches baseline fixtures.
- [ ] 3.3 Keep local development file persistence and deployed localStorage serialization unchanged; verify Confirm, Cancel, reload, and legacy-selection behavior through focused tests and manual Procedural-window checks.

## 4. Decompose game-session orchestration

- [x] 4.1 Extract game-service construction and lifecycle disposal into a `game-session` factory while retaining `startGameLayer` as the existing facade; verify game startup, restart, and disposal tests pass.
- [ ] 4.2 Extract input, generation-preview, minimap, mapview, and world-render scheduling controllers from the game entry module; verify rendering, scheduler, transition, and bridge tests pass without changed commands.
- [ ] 4.3 Reduce `game-layer-babylon-lite/index.js` to composition and stable export wiring; verify its public imports and production build succeed.

## 5. Decompose the React UI and contracts

- [ ] 5.1 Extract windows, HUD/character/quest/log components, and stored-setting helpers from `App.jsx` into owner-specific modules; verify visible labels, focus behavior, persisted preferences, and bridge messages remain unchanged.
- [ ] 5.2 Split `main_tests.mjs` into mirrored focused contract tests for build/documentation, UI windows, and game-session behavior; verify every moved test remains executed by the Node test command.
- [ ] 5.3 Update the explicit test command only after the final test paths exist; verify `npm.cmd test` runs all existing and newly split test modules.

## 6. Validate the refactor

- [x] 6.1 Run focused generation, settings, world, rendering, bridge, and UI tests plus `npm.cmd test`; verify no deterministic, persistence, or public-contract regression.
- [x] 6.2 Run `npm.cmd run build`; verify the GitHub Pages production bundle completes without new dependencies.
- [ ] 6.3 Manually verify Procedural preview/Confirm/Cancel, normal generation in both realms, movement, minimap/mapview, and key windows at supported responsive layouts; verify no visible behavior changes.
