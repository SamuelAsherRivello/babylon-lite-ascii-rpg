# Tasks

## 1. Spider presentation foundation

- [ ] 1.1 Define the Spider animation frame sets, timing, asset resolution, facing treatment, and bottom-centered grid-cell placement in the Babylon Lite game layer; verify every Idle, Move, Attack, and Death frame path resolves from the checked-in asset directory.
- [ ] 1.2 Add living-enemy presentation records and DOM image overlays that suppress the visible game-view enemy glyph while preserving authoritative occupancy, mapview, and minimap behavior; verify a live enemy remains a one-cell combat target.
- [ ] 1.3 Connect committed enemy movement and attack outcomes to move and attack animation states with idle fallback; verify focused tests cover stationary, moved, and attacking spiders without changing enemy health, damage, or tick cadence.

## 2. Death-frame lifecycle

- [ ] 2.1 Convert an enemy zero-health event into a detached non-interactive Spider death presentation, while retaining immediate occupancy removal and tick unregistration; verify an enemy cannot block, act, target, or receive damage after death.
- [ ] 2.2 Keep final death frames in runtime memory for the current realm visit without pruning them when fogged or offscreen, and clear them when that realm is left; verify focused tests cover revisit visibility and leave-and-return removal.

## 3. Verification

- [ ] 3.1 Run focused enemy-system and rendering tests with the direct Node test runner and verify existing enemy AI, damage, spawner, and NPC boundaries remain unchanged.
- [ ] 3.2 Run `npm.cmd run build` from the repository root and verify the production build succeeds.
- [ ] 3.3 Manually verify a seeded browser session using an explicit `randomSeed`: observe a spider idle, move, attack, die, retain its final frame after leaving the viewport, and disappear after leaving and returning to the realm; verify the `S` spawner and NPCs are unchanged.
