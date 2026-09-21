# Tasks

## 1. Numeric fog state and falloff

- [ ] 1.1 Replace boolean per-cell discovery storage with persistent `0..100`
  visibility and expose authoritative numeric read/update behavior; preserve
  world reset and positive-visibility eligibility semantics.
- [ ] 1.2 Implement the four normalized-distance bands (`100/75/50/25`),
  exact-radius behavior, clear-path blocking, walkable-cell rules, and
  maximum-ever retention for repeated player discovery.
- [ ] 1.3 Update minimap aggregate bookkeeping so coarse-area opacity reflects
  the average persistent visibility of eligible walkable cells, including
  repeated visibility upgrades and empty-area behavior.

## 2. Shared world-view and rendering integration

- [ ] 2.1 Carry numeric visibility through shared world-view composition while
  preserving zero-visibility slot reconciliation for the game view.
- [ ] 2.2 Apply fog opacity to game-view sprite presentation after lighting and
  include visibility in sprite update state so partial-to-full upgrades redraw
  correctly.
- [ ] 2.3 Apply the same per-cell fog opacity to mini-map world glyphs and
  world-owned light presentation while preserving background, glyph, lighting,
  and marker ordering.

## 3. Focused verification

- [ ] 3.1 Extend fog-system tests for initial zero state, four distance bands,
  radius boundary, blocked paths, unwalkable cells, maximum retention, world
  reset, and repeated upgrades.
- [ ] 3.2 Extend world-view, rendering, and mini-map tests for zero hiding,
  `25/50/75/100` alpha, shared visibility, aggregate opacity, cache
  invalidation, and marker/lighting pass behavior.
- [ ] 3.3 Run the repository's focused Node tests, full Node suite, and
  production build; record any unrelated dirty-worktree limitations without
  modifying or reverting those files.
- [ ] 3.4 Manually inspect the live game in landscape and portrait modes,
  verify partial-opacity terrain near the player, persistent upgrades after
  movement, minimap opacity, markers, lighting, and world reset behavior; do
  not create or run Playwright tests.
