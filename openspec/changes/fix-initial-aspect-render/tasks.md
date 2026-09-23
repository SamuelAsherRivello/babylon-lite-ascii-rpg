# Tasks

## 1. Establish correct initial game state

- [x] 1.1 Apply the normalized persisted Aspect selection to the document before the game module creates the canvas, and verify saved landscape and portrait values select their respective CSS presentation frames before `startGameLayer` runs.
- [x] 1.2 Supply normalized saved camera and zoom settings when `startGameLayer` is constructed, and verify absent, legacy, and current zoom values use the existing defaults and migration behavior.

## 2. Remove the redundant startup world render

- [x] 2.1 Make Babylon Lite restore an already-active aspect, camera mode, or zoom as a no-op, and verify controller attachment does not schedule a viewport rebuild or camera correction.
- [x] 2.2 Preserve real Aspect, camera, and zoom change behavior, and verify a user setting change still updates its viewport or player position as expected.

## 3. Verify the startup contract

- [x] 3.1 Add or update focused Node/source tests for bootstrap ordering, startup camera/zoom delivery, and no-op versus changed-setting behavior; verify the affected tests pass.
- [x] 3.2 Run `npm.cmd test` and `npm.cmd run build`; verify results while distinguishing pre-existing unrelated failures.
- [x] 3.3 Manually refresh the local game with saved landscape and saved desktop portrait settings; verify the first visible player position matches the active frame and no settings-driven corrective movement appears.
