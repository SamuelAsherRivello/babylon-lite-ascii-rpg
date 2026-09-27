# Tasks

## 1. Terrain optical state

- [x] 1.1 Add explicit `blocksLight` terrain state for generated floors, walls, mountains, water, and other canonical terrain, while preserving water as non-walkable; verify focused world-generation tests assert both properties.
- [x] 1.2 Audit dynamic terrain and object state changes, synchronizing opaque open/closed behavior with `blocksLight` and lighting invalidation; verify a stationary light field updates after the transition.

## 2. Lighting behavior

- [x] 2.1 Replace walkability-derived light blocking with one shared explicit-occlusion predicate and legacy fallback across path, blocker-count, visible-field, and player-penumbra calculations; verify existing opaque-wall shadow tests continue to pass.
- [x] 2.2 Add focused lighting tests proving non-walkable water transmits direct and diagonal light while an explicit opaque blocker still shadows targets; verify the focused Node test file passes.

## 3. Integration verification

- [x] 3.1 Run the relevant Node test suite and `npm.cmd run build`; verify both pass without adding Playwright tests.
- [x] 3.2 Manually verify a seeded game world where water lies between a light source and a target, confirming water remains impassable and the target is illuminated; record the exact URL and result: `http://127.0.0.1:5178/babylon-lite-ascii-rpg/?skipTutorial=true&randomSeed=water-light-occlusion-2026-09-27` showed player light continuing across water at Underground ambient `0.0`; a downward movement attempt left the player blocked by the adjacent water cell.
