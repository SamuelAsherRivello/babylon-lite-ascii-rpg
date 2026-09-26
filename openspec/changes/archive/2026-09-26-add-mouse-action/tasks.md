# Tasks

## 1. Central movement and action resolution

- [x] 1.1 Extract one planning-safe directional target classifier and one effectful player direction resolver for movement, contact, and denial; route WASD, arrows, swipes, and generated mouse directions through it, and verify focused tests prove equivalent cardinal enemy and mountain outcomes.
- [x] 1.2 Route the existing heading-based Space bomb request through the centralized player-action boundary without changing its target or inventory behavior; verify the existing bomb and character-action focused tests still pass.
- [x] 1.3 Preserve keyboard and swipe diagonal movement while limiting mouse-generated directions to cardinal steps; verify focused input-controller and player-grid tests cover both paths.

## 2. Action-aware mouse targeting

- [x] 2.1 Extend the bounded mouse route helper to distinguish a white reachable travel target, a green reachable cardinal-adjacent action target, and a red denied target using current terrain, occupancy, object, realm, and character capabilities; verify focused tests cover enemies, Pickaxe-equipped Overground mountains, missing capabilities, Underground walls, and over-limit routes.
- [x] 2.2 Plan a green target to a deterministic reachable cardinal-adjacent cell within 50 movement steps, then emit the final ordinary direction into the target; verify focused tests cover detours, no adjacent route, and no diagonal mouse action.
- [x] 2.3 Reclassify a held pointer target before every repeat, including after an action changes its target cell, and stop on a lost route or capability; verify focused tests cover an enemy or mountain becoming white travel terrain and dynamic blockers that require rerouting or stopping.

## 3. Reticle and input integration

- [x] 3.1 Update the exact-cell four-corner reticle presentation to render white for travel, green for current action, and red for denial while preserving HUD exclusion; verify focused rendering/input tests cover all three colors and target states.
- [x] 3.2 Connect primary held walking and secondary held sprinting to white and green classifications, preserving pointer capture, release, gameplay locks, and playable-canvas context-menu suppression; verify focused input tests cover both buttons and red-target rejection.

## 4. Integrated verification

- [x] 4.1 Run the revised focused mouse-navigation, input-controller, player-grid, combat, mountain, bomb, and character-contact Node tests, then run `npm.cmd test` and `npm.cmd run build` from the repository root.
- [x] 4.2 Manually verify with an explicit `randomSeed` that white targets travel, green enemies and Overground mountains route to cardinal adjacency and use normal repeated actions, unavailable Underground walls remain red, both mouse buttons use their expected cadences, and keyboard/arrow/swipe interactions match the same outcomes.
- [x] 4.3 Run `openspec validate add-mouse-action --strict` and retain unrelated worktree changes.
