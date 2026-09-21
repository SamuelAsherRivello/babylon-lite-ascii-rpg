# Tasks

## 1. Combat-stat calculations

- [x] 1.1 Add a pure combat-stat module with starting stamina `50 / 50` and initial Offense and Defense maximums of `25`, linear stamina-derived current values, normalized percentages, clamping, and immutable snapshots; verify full, partial, zero, and recovery cases with focused Node tests.
- [x] 1.2 Add pure player-damage and defense-mitigation calculations using maximum damage inputs, normalized current stat ratios, nearest/ceiling rounding as specified, the 50% mitigation cap, and minimum damage of `1`; verify boundary values with focused Node tests.
- [x] 1.3 Integrate the combat-stat state with the existing stamina subscription without changing stamina constants, attack cost, movement-only recovery, health lifecycle, or time causes; verify existing stamina and combat tests remain passing.

## 2. Runtime combat integration

- [x] 2.1 Update player collision combat against enemies and enemy spawners to calculate applied damage from current Offense while preserving occupancy, attack stamina spending, combat tick advancement, logs, and lethal removal; verify full, reduced, and exhausted attacks.
- [x] 2.2 Update enemy adjacency attacks to calculate player damage from configured maximum enemy damage and current player Defense before calling the existing player lifecycle; verify full, partial, and zero-defense damage plus player death behavior.
- [x] 2.3 Publish immutable Offense and Defense snapshots through the existing bridge and subscribe them from the game controller/UI entrypoint; verify snapshots change after attacks and movement-driven recovery without exposing mutable game state.

## 3. Character HUD

- [x] 3.1 Replace static React Offense and Defense data with authoritative current/max snapshots while preserving the existing five-row Character layout, color derivation, delta transition, accessibility values, and experience presentation; verify the HUD displays reduced bars after an attack and refilled bars after retreat.
- [x] 3.2 Update bridge, character-data, main-entrypoint, and UI tests for initial maximums, normalized current percentages, immutable snapshots, and no React-owned combat calculations; verify the focused bridge and Character tests pass.

## 4. Verification and documentation

- [x] 4.1 Update source-boundary and integration tests to confirm Babylon Lite remains authoritative for combat stats and damage while React receives snapshots only; verify the relevant architecture and main tests pass.
- [x] 4.2 Run the repository's documented Node test suite and resolve regressions without changing the completed health or stamina contracts; record the exact result: 257 tests passed.
- [x] 4.3 Run the production build and manually verify the live browser sequence at `http://127.0.0.1:5173/babylon-lite-ascii-rpg/`: full `50 / 50` stamina with `25 / 25` Offense and Defense, attack to `25` stamina with `13 / 25` Offense and Defense, retreat to `35` stamina with `18 / 25`, player damage `20` at full Offense, enemy damage `3` at reduced Defense; lethal enemy/player lifecycle paths remain covered by the focused Node tests.
