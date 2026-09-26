# Tasks

## 1. Trace and repair the authoritative chest lifecycle

- [ ] 1.1 Trace the live keyboard and pointer movement paths from input through destination contact resolution, document the failing branch in code comments or tests, and verify the trace with a focused integration test
- [ ] 1.2 Repair first-contact chest dispatch so standalone and house-owned chests open from one cardinal movement input after combat resolution, and verify the player remains outside the chest cell
- [ ] 1.3 Ensure chest opening emits exactly one opening log through the active Log System and bridge snapshot, and verify repeated contact does not duplicate it

## 2. Repair Heart registration, rendering, and collection

- [ ] 2.1 Make the guaranteed Heart reward register in the active realm's authoritative object and pickup collections using the normal Heart definition and effect, and verify exactly one Heart is created
- [ ] 2.2 Invalidate the affected chest and reward cells through the active game renderer and map/minimap paths, and verify the Heart becomes visible immediately without reload or unrelated movement
- [ ] 2.3 Preserve valid neighboring-cell and occupancy rules, including the no-valid-cell case, and verify focused object-spawner tests cover player, terrain, active-object, and duplicate-reward exclusions
- [ ] 2.4 Verify walking into the spawned Heart applies its effect once and emits the Heart collection log through the active Log System and bridge snapshot

## 3. Add actual-game acceptance coverage

- [ ] 3.1 Add a deterministic seeded actual-game browser test that starts the built game, opens the Log panel, walks the player into a generated chest, and verifies the chest changes to its open state
- [ ] 3.2 Extend the actual-game test to locate and observe the nearby Heart, walk into it, and verify both the chest-opening and Heart-collection logs are visible in the live game UI
- [ ] 3.3 Run focused Node tests for movement, object spawning, and logs; verify `npm.cmd test` and `npm.cmd run build` from the repository root
- [ ] 3.4 Run OpenSpec strict validation for `fix-chest-and-heart-bugs` and manually report any failures caused by unrelated dirty work rather than changing unrelated files
