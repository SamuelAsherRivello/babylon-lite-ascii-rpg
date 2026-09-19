# Tasks

## 1. World data and deterministic placement

- [x] 1.1 Extend the world character contract with the lowercase `T` glyph and
  add deterministic wall-adjacent torch candidate selection using a requested
  density-derived count; verify the requested count is reproducible and valid.
- [x] 1.2 Preserve torch positions and underlying terrain during player
  movement and seeded resize redraws; verify torch cells remain walkable and
  torch placement is identical for repeated generation with the same options,
  seed, and count.

## 2. Babylon Lite rendering

- [x] 2.1 Add the `T` glyph frame to the Babylon Lite Sprite2D atlas and derive
  the game-layer torch count from world area versus visible zoom-5 screen area;
  verify the browser uses the density-derived count without changing terrain
  rendering.
- [x] 2.2 Ensure player rendering remains top-most and movement does not erase
  torches; verify a player glyph hides terrain while torch glyphs hide only
  their underlying terrain glyph.

## 3. Verification

- [x] 3.1 Add focused Node tests for density-derived count, wall adjacency,
  determinism, player avoidance, walkability preservation, and visible glyph
  precedence; verify the focused tests pass from the repository root.
- [x] 3.2 Run the complete repository test command, production build,
  `git diff --check`, and strict OpenSpec validation for
  `add-random-torches`; manually verify the running browser uses the
  screen-relative torch density and preserves torches during movement and
  resize.
