# Tasks

## 1. Combat-stat calculations

- [ ] 1.1 Add a pure combat-stat module with starting stamina `50 / 50` and initial Offense and Defense maximums of `25`, linear stamina-derived current values, normalized percentages, clamping, and immutable snapshots; verify full, partial, zero, and recovery cases with focused Node tests.
- [ ] 1.2 Add pure player-damage and defense-mitigation calculations using maximum damage inputs, normalized current stat ratios, nearest/ceiling rounding as specified, the 50% mitigation cap, and minimum damage of `1`; verify boundary values with focused Node tests.
- [ ] 1.3 Integrate the combat-stat state with the existing stamina subscription without changing stamina constants, attack cost, movement-only recovery, health lifecycle, or time causes; verify existing stamina and combat tests remain passing.

## 2. Runtime combat integration

- [ ] 2.1 Update player collision combat against enemies and enemy spawners to calculate applied damage from current Offense while preserving occupancy, attack stamina spending, combat tick advancement, logs, and lethal removal; verify full, reduced, and exhausted attacks.
- [ ] 2.2 Update enemy adjacency attacks to calculate player damage from configured maximum enemy damage and current player Defense before calling the existing player lifecycle; verify full, partial, and zero-defense damage plus player death behavior.
- [ ] 2.3 Publish immutable Offense and Defense snapshots through the existing bridge and subscribe them from the game controller/UI entrypoint; verify snapshots change after attacks and movement-driven recovery without exposing mutable game state.

## 3. Character HUD

- [ ] 3.1 Replace static React Offense and Defense data with authoritative current/max snapshots while preserving the existing five-row Character layout, color derivation, delta transition, accessibility values, and experience presentation; verify the HUD displays reduced bars after an attack and refilled bars after retreat.
- [ ] 3.2 Update bridge, character-data, main-entrypoint, and UI tests for initial maximums, normalized current percentages, immutable snapshots, and no React-owned combat calculations; verify the focused bridge and Character tests pass.

## 4. Verification and documentation

- [ ] 4.1 Update source-boundary and integration tests to confirm Babylon Lite remains authoritative for combat stats and damage while React receives snapshots only; verify the relevant architecture and main tests pass.
- [ ] 4.2 Run the repository's documented Node test suite and resolve regressions without changing the completed health or stamina contracts; record the exact result.
- [ ] 4.3 Run the production build and manually verify a live browser sequence of full-stamina attack, reduced Offense/Defense bars, retreat recovery, reduced outgoing damage, mitigated incoming damage, enemy death, and player death; record the verified URL and outcomes.
