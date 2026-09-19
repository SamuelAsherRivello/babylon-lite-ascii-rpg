# Tasks

## 1. World model and generator

- [x] 1.1 Define explicit world-cell, terrain-layer, character-layer, and
  generator-option data structures and verify unit tests cover dimensions,
  `W`/`•` walkability, and layer storage.
- [x] 1.2 Implement caller-provided and generated seed resolution, fixed 4–5
  cellular-automata smoothing, wall-fill percentage, smoothing-pass count, and
  forced wall border; verify identical resolved seeds produce identical
  layouts.
- [x] 1.3 Implement connected-region selection or bounded regeneration and
  choose a valid player start; verify accepted maps contain one sufficiently
  large connected walkable region and reject impossible small inputs clearly.
- [x] 1.4 Retain the resolved seed on the generated world and verify omitted
  seeds produce fresh level identities that can regenerate the same terrain
  when reused.

## 2. Movement and rendering integration

- [x] 2.1 Integrate generated world dimensions and player start state with the
  existing grid movement while preserving WASD, arrows, diagonal input, and
  repeat timing; verify focused player-grid tests pass.
- [x] 2.2 Reject movement into walls and outside world bounds without changing
  the player cell; verify cardinal, diagonal, held-key, and collision cases.
- [x] 2.3 Render terrain and character layers with character-over-terrain
  precedence and viewport-aware world mapping; verify `P` hides its underlying
  terrain while empty cells display `W` or `•`.

## 3. Verification

- [x] 3.1 Add focused generator, layering, collision, and rendering tests and
  verify `npm.cmd test` passes.
- [x] 3.2 Build and run the Vite app, then verify in a real browser that a
  generated bordered cave renders, the player starts on walkable terrain, and
  movement stops at walls; verify `npm.cmd run build` also passes.
