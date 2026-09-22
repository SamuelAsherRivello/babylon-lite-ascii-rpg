# Tasks

## 1. UI Launcher and Bridge

- [x] 1.1 Add a `Map` button under the lower-left Info section and verify existing source tests or snapshots detect the launcher label and open action.
- [x] 1.2 Add narrow UI-to-game mapview open/close and realm-toggle commands or controller methods without exposing world cells or entity collections to React, and verify bridge tests cover registration, open, close, toggle, and cleanup behavior.
- [x] 1.3 Add the fullscreen mapview overlay and lower-left `X` plus `Toggle Realm` controls with responsive styling, and verify the overlay hides all other UI in landscape without changing persisted settings.

## 2. Game-Layer Mapview Rendering

- [x] 2.1 Add a Babylon Lite-owned mapview presentation surface or canvas and verify it is created, resized, rendered, closed with mapview-only buffers/caches released, and disposed with the game layer.
- [x] 2.2 Render the selected mapview realm through the shared world-view composition with a full-realm source rectangle and landscape fit-to-screen destination sizing, opening on the player's current realm and allowing diagnostic realm cycling, and verify focused world-view/mapview tests cover the computed full-realm bounds.
- [x] 2.3 Implement mapview fog bypass through a read-only visibility resolver and verify tests prove undiscovered cells render while stored fog/discovery state remains unchanged.
- [x] 2.4 Apply diagnostic lighting with effective ambient `1` and no player, torch, shadow, or GPU light-pass darkening, and verify tests prove game/minimap lighting settings are unchanged after mapview rendering.

## 3. Diagnostic Markers and Input Gating

- [x] 3.1 Add game-layer mapview marker projection for start, player, quest objects, torches, items, enemies, and spawners, and verify marker tests cover active/inactive entities and draw ordering above world content.
- [x] 3.2 Ensure mapview marker rendering excludes minimap quest edge indicators and offscreen navigation indicators, and verify focused tests distinguish mapview markers from minimap indicators.
- [x] 3.3 Suppress gameplay keyboard input while mapview is open and clear held movement on close, and verify focused tests show movement/camera keyboard commands do not mutate gameplay state while open but resume after close.

## 4. Regression and Browser Verification

- [x] 4.1 Run focused Node tests for world-view, minimap renderer, bridge/UI, and game-layer mapview behavior, and verify all selected tests pass.
- [x] 4.2 Run `npm.cmd run build` from the repository root and verify the production build succeeds.
- [x] 4.3 Manually verify the running app in landscape: open Info -> Map, confirm the mapview fills the screen, the full active realm is visible, fogged areas are visible, markers show item/enemy/spawner distribution, quest edge indicators are absent, keyboard movement is ignored while open, and normal input resumes after close.
