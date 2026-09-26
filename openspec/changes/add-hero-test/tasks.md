# Tasks

## 1. Hero asset and rendering setup

- [x] 1.1 Register the copied `Hero_Warrior` side-facing idle, run, attack, and death assets and verify each source frame loads from the project-local asset path
- [x] 1.2 Add an anchored hero sprite path with a single scale constant, verify the native 32×48 art is readable and bottom-centered over the hero's one-cell footprint
- [x] 1.3 Preserve glyph fallback behavior and verify the hero remains visible when raster assets are unavailable or the test path is disabled

## 2. Animation and lifecycle integration

- [x] 2.1 Map stationary, walking, and attacking gameplay states to the corresponding side-facing hero animations and verify each transition in the live game
- [x] 2.2 Map zero health to the side-facing death animation, freeze on its final frame, and verify the hero remains onscreen
- [x] 2.3 Stop movement, combat, collision, targeting, and other interaction updates after death while preserving the corpse visual; verify the dead hero is inert

## 3. Focused verification

- [x] 3.1 Run focused existing Node tests and `npm.cmd run build` from the repository root, then verify the playable hero test manually with an explicit `randomSeed`
- [x] 3.2 Present the live build for human review of scale, anchoring, animation readability, and permanent corpse behavior before expanding the art treatment to NPCs or enemies
