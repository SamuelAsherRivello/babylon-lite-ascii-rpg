# Tasks

## 1. Rendering foundation

- [x] 1.1 Add the full-viewport gameplay canvas in the existing
  `content_layer`, preserving the separate corner `ui_layer`, and verify the
  existing page-shell test still passes.
- [x] 1.2 Implement screen-size, logical-size, `upscale`, font-resolution, and
  `32 x 32` grid-cell calculations, then verify one-to-one and `upscale=2.0`
  viewport cases with focused tests.
- [x] 1.3 Render the centered `P` glyph from integer player-cell coordinates
  and verify its center aligns with the selected cell center at initial load
  and after a resize.

## 2. Player movement

- [x] 2.1 Add the integer grid-position model with initial center placement and
  screen-sized boundary clamping; verify cardinal and diagonal candidate cells
  cannot place the full player cell outside the logical viewport.
- [x] 2.2 Map WASD and arrow keys to cardinal directions, prevent handled arrow
  key scrolling, and verify equivalent keys produce equivalent cell moves.
- [x] 2.3 Implement combined held-direction vectors for eight-way movement and
  verify releasing one direction from a diagonal leaves the other direction
  active.
- [x] 2.4 Implement explicit held-key timing with immediate movement, a
  `0.25s` initial delay, and `0.125s` repeat intervals; verify release stops
  all further scheduled movement and native key auto-repeat does not duplicate
  steps.

## 3. Integration and verification

- [x] 3.1 Integrate resize handling, canvas redraws, input cleanup, and player
  clamping; verify resizing near each screen edge keeps the `P` visible.
- [x] 3.2 Extend focused automated coverage for rendering dimensions, glyph
  placement, keyboard mappings, repeat timing, diagonals, and boundaries, then
  verify `npm test` passes.
- [x] 3.3 Build the production bundle and verify `npm run build` passes.
- [x] 3.4 Run the Vite app in a browser at multiple viewport sizes and verify
  the full-screen canvas, centered `P`, responsive resize behavior, cardinal
  movement, diagonal movement, repeat timing, and edge clamping visually.
