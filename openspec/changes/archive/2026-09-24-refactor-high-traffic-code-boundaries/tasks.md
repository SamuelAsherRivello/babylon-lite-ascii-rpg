# Tasks

## 1. Establish refactor safeguards

- [x] 1.1 Record deterministic Overworld and Underground generation fixtures, normalized settings snapshots, and current bridge/UI contracts; verify focused existing Node tests pass before moving code.
- [x] 1.2 Identify and preserve the public exports, persisted generation-settings shape, storage key, pass order, and active working-tree ownership; verify no unrelated dirty file is staged or overwritten.

## 2. Create the generation-layers boundary

- [x] 2.1 Create `generation-layers/` and its registry with feature order, realms, dependencies, semantic cards, descriptions, and density policy.
- [x] 2.2 Extract grid and terrain behavior with explicit context inputs and preserve seeded cave/wall fixtures.
- [x] 2.3 Extract water and walkability behavior and preserve deterministic lake depth, walkability, and ordered-pass behavior.
- [x] 2.4 Extract player placement and static object distribution and preserve player-start, torch, pickup, and object-spawner behavior.
- [x] 2.5 Extract civilization and dynamic-entity setup and preserve paired stairs, doors, NPC, and enemy-spawner ordering.
- [x] 2.6 Reduce `world-system.js` responsibilities to stable world-state and public-facade behavior.

## 3. Consolidate settings ownership

- [x] 3.1 Route settings metadata and density details through the generation-layer registry while preserving normalization.
- [x] 3.2 Convert `generation-profile.js` into a registry-backed compatibility adapter.
- [x] 3.3 Preserve local development persistence and deployed localStorage serialization, including Confirm, Cancel, reload, and legacy-selection behavior.

## 4. Decompose game-session orchestration within the bounded scope

- [x] 4.1 Extract game-service construction and lifecycle disposal into a game-session factory while retaining `startGameLayer`.
- [x] 4.2 Extract input, generation-preview, minimap, mapview, and world-render scheduling controllers.
- [x] 4.3 Preserve stable game-layer exports and production-build compatibility for the bounded controller extraction.

## 5. Decompose the React UI and contracts within the bounded scope

- [x] 5.1 Extract the scoped windows, character/quest/log components, palette/generation controls, and stored-setting helpers from `App.jsx`.
- [x] 5.2 Update the source-contract harness to read extracted UI modules and preserve the existing contract coverage.
- [x] 5.3 Keep the existing explicit Node test command coherent with the completed bounded test coverage.

## 6. Validate the bounded refactor

- [x] 6.1 Run focused generation, settings, world, rendering, bridge, and UI tests plus the Node suite; preserve known unrelated dirty-worktree failures without overwriting them.
- [x] 6.2 Run the production build and verify the GitHub Pages bundle completes without new dependencies.
- [x] 6.3 Record the completed bounded scope; broader entry-point decomposition and extended manual browser verification are explicitly outside this change and require a separate proposal if pursued.
