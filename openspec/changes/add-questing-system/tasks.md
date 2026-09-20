# Tasks

## 1. Quest definitions and runtime state

- [x] 1.1 Add `ascii-rpg/src/runtime/game-layer-babylon-lite/data/quest_data.json` with the static Collect Gold definition, relative gold criterion, target `3`, display strings, pickup type, and future-compatible absolute criterion shape; verify the JSON parses and exposes the expected fields.
- [x] 1.2 Implement an in-memory quest state module with `unstarted`, `pending`, and `complete` lifecycle states, one-entry active-quest tracking, relative baseline capture, absolute criterion evaluation, progress updates, and immutable snapshots; verify focused unit tests cover start, baseline, progress, immediate absolute completion, and final completion.
- [x] 1.3 Implement generic pickup records and collection events with runtime IDs, type, world cell, active state, and one-shot effects; verify a collected pickup cannot apply its effect twice when revisited.

## 2. World generation, gold, and character state

- [x] 2.1 Generate exactly three distinct gold pickups in the initial active realm using seeded random valid walkable cells targeted approximately 10, 30, and 100 grid cells from player start; verify focused generation tests cover valid cells, separation, deterministic seed behavior, and bounded distance fallback.
- [x] 2.2 Render active gold pickups in-world with the existing gold glyph `◆` and restore the underlying world character correctly when the player leaves or collects a pickup; verify movement and rendering tests cover pickup, torch, stair, and player precedence.
- [x] 2.3 Apply `+1` character gold through the pickup effect and publish the runtime gold value through the existing bridge without persisting it; verify collection updates the value once and browser-refresh initialization returns to zero.

## 3. Quest bridge, toasts, and HUD

- [x] 3.1 Extend the narrow game bridge with immutable quest snapshots and subscriptions containing quest identity, title, objective, criterion mode, baseline when relevant, state, progress, target, and completion; verify bridge tests cover initialization, progress, and completion snapshots.
- [x] 3.2 Trigger the existing toast system on quest start, each progress update, and completion with the exact messages `Quest Started: Collect Gold.`, `Quest Progress: Collect Gold 1 of 3.`, and `Quest Completed: Collect Gold.`; verify toast-state tests cover all three transitions.
- [x] 3.3 Add the React quest tracker 25px below the character box with title `Question: Collect Gold`, a smaller body indented 5px, live progress text, and completion strike-through while retaining the completed quest; verify focused UI tests cover the exact text, spacing classes/styles, and completed rendering.
- [x] 3.4 Replace the UI-only gold display with the game-owned runtime gold snapshot while preserving the existing character HUD glyph and layout; verify the HUD changes after collection without adding persistence.

## 4. Minimap quest markers

- [x] 4.1 Extend minimap marker composition with fog-independent active quest pickup markers at the agreed depth below torches and the player; verify marker tests cover fogged terrain, yellow in-map squares, and player precedence.
- [x] 4.2 Project off-screen quest pickups to distinct yellow directional chevrons on the minimap boundary, including deterministic separation when multiple pickups share an edge region; verify renderer tests cover targets outside each edge and all three simultaneous pickups.
- [x] 4.3 Preserve minimap zoom, visibility, fog discovery, and realm behavior while refreshing quest markers after movement, pickup collection, and quest completion; verify focused integration tests cover render scheduling and marker removal.

## 5. Integration verification

- [x] 5.1 Run `npm.cmd test` from the repository root and verify the full Node test suite passes with the quest and minimap tests included.
- [x] 5.2 Run `npm.cmd run build` from the repository root and verify the Vite production build succeeds.
- [x] 5.3 Manually verify the playable browser flow: refresh starts Collect Gold at 0 of 3, three gold objects appear in the initial realm, markers are visible in-map or as edge chevrons, collection shows progress toasts and updates gold, and completion strikes through the retained HUD body.
