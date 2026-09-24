# Tasks

## 1. Gameplay State and Damage Accounting

- [x] 1.1 Extend character item normalization and immutable snapshots with `1000` maximum/current health for Sword, Pickaxe, and Shield, preserving empty-slot and legacy-item normalization; verify focused character-state and bridge tests.
- [x] 1.2 Add a single clamped item-health wear/depletion path that removes an item at zero and republishes character state; verify partial damage, lethal damage, and slot removal tests.
- [x] 1.3 Apply Sword wear from actual resolved enemy and enemy-spawner damage and disable the Sword responder after depletion; verify combat damage and no-attack-after-break tests.
- [x] 1.4 Apply Pickaxe wear from actual mountain health removed and disable mountain digging after depletion; verify mountain damage, lethal wear, and missing-Pickaxe tests.
- [x] 1.5 Apply Shield wear from final post-Defense player damage and fall back to body damage after depletion; verify incoming enemy damage, Shield depletion, and no-shield mitigation tests.

## 2. Character-Corner Presentation

- [x] 2.1 Extend the React character-state consumption and inventory slot presentation with compact accessible current/max health bars for durable items; verify initial `1000 / 1000` rendering and bridge-driven updates.
- [x] 2.2 Render depleted inventory slots using the existing empty-slot placeholders and keep resource cells and existing character bars within the six-cell layout; verify focused UI tests and manual desktop/portrait layout checks.

## 3. Integration Verification

- [x] 3.1 Run focused Node tests covering character state, combat, mountain systems, bridge snapshots, and UI presentation, and resolve any regressions.
- [x] 3.2 Run `npm.cmd test` and `npm.cmd run build` from the repository root; verify the existing test suite and production build pass.
- [x] 3.3 Verify the seeded browser session using explicit `randomSeed` evidence: Pickaxe durability visibly decreased from `1000` to `931` across mountain hits with matching damage logs; Sword and Shield wear/depletion paths were verified through the focused combat/state tests and live character-meter bridge, with capability removal represented by zero-health slot removal.
