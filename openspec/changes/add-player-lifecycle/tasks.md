# Tasks

## 1. Trap consequence and authoritative game lifecycle

- [x] 1.1 Update the JSON object catalog Trap consequence and log text to `-25`, then verify the catalog assertions and focused object-spawner tests pass
- [x] 1.2 Add Babylon Lite dead-state ownership, zero-health clamping, and one-time death transition, then verify health and death-state unit coverage
- [x] 1.3 Gate movement entry points, collision consequences, time advancement, movement events, and post-death rendering work after death, then verify dead-player scenarios leave state unchanged

## 2. Narrow bridge integration

- [x] 2.1 Add immutable death snapshot getter, sender, and subscription functions using the existing bridge conventions, then verify bridge tests cover initial and terminal states
- [x] 2.2 Wire the game controller death snapshot through `main.jsx`, then verify game startup publishes health and death state without exposing mutable game data

## 3. Death prompt and restart interaction

- [x] 3.1 Add the tutorial-format `Adventure` death modal with exact body copy, exact bullets `XP: 00`, `Gold: 00`, `Time: 00`, and `Restart Game`, then verify structural UI tests cover all required text
- [x] 3.2 Keep the death prompt modal and gameplay input blocked until restart, then verify backdrop, keyboard, and pointer interactions do not dismiss or move the dead run
- [x] 3.3 Implement `Restart Game` through the browser reload path, then verify the action is wired and a fresh session returns to initial health, gold, time, quest, and alive state

## 4. Verification and live behavior

- [x] 4.1 Update mirrored Node tests for trap damage, health floor, death idempotence, bridge publication, prompt copy, and restart wiring, then verify `npm.cmd test` passes
- [x] 4.2 Run `npm.cmd run build`, `git diff --check`, and `openspec validate "add-player-lifecycle" --strict`, then verify only scoped lifecycle artifacts and implementation files are attributable to this change
- [x] 4.3 Manually verify the running browser game can trigger a lethal Trap, shows the exact Adventure prompt, blocks gameplay, and reloads to a fresh run without creating Playwright tests
