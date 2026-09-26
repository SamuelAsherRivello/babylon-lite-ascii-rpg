# Tasks

## 1. Character depth model

- [x] 1.1 Add a presentation-only helper that derives deterministic character depth keys from authoritative player/enemy/NPC cells, and verify focused Node tests prove greater `y` renders in front and equal `y` remains stable.
- [x] 1.2 Define the shared game-view character overlay and its retained-element lifecycle, and verify out-of-region, fogged, and prior-realm character elements are removed or hidden during reconciliation.

## 2. Game-view presentation

- [x] 2.1 Move hero and animated enemy game-view elements into the shared character overlay while preserving their current frames, facing, geometry, and animation updates; verify the affected focused rendering tests pass.
- [x] 2.2 Present visible NPC characters through the shared overlay while preserving their authoritative glyph/palette identity and suppressing only their duplicate game-view canvas glyph; verify NPC-focused rendering coverage passes.
- [x] 2.3 Apply recalculated y-based depth keys to player, enemy, and NPC elements after movement, camera updates, and realm transitions; verify focused tests cover each reconciliation trigger without mutating occupancy or world cells.

## 3. Verification

- [x] 3.1 Run the focused Node rendering and depth-order test files plus `npm.cmd run build`, and record any unrelated failures separately.
- [x] 3.2 Manually inspect a seeded game view using an explicit `randomSeed` with overlapping player, enemy, and NPC presentations; verify the actor at the greater grid `y` is visibly in front and equal-y actors stay stable across redraws.
