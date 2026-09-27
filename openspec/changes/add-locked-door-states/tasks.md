# Tasks

## 1. Door state and generation contract

- [x] 1.1 Add an explicit locked/closed/open Door state model with legacy-open compatibility; verify focused Door and object-spawner tests cover all three states.
- [x] 1.2 Make Underground fence Doors and Home Doors generate as locked while preserving horizontal, vertical, and front orientation; verify deterministic civilization and Building generation tests.
- [x] 1.3 Update locked-Door action resolution so one carried Key transitions it directly to open and a closed Door remains blocked; verify cardinal interaction, key spending, logs, walkability, and later entry tests.

## 2. Gold-key and Door artwork

- [x] 2.1 Register `golden_key.png` as the shared static Key asset and add an orientation/state Door-art resolver; verify focused image-source and raster-composition tests cover front and side locked, closed, and open Doors.
- [x] 2.2 Compose a locked Door from closed Door art plus a positioned gold-padlock overlay, retaining the unoverlaid closed and open variants; verify game-view sprite bounds, atlas cache identity, fog, and lighting behavior.
- [x] 2.3 Replace live-world Key glyph presentation with gold-key artwork while preserving pickup identity and palette compatibility; verify generation/rendering and Key pickup tests.

## 3. Preview and HUD parity

- [x] 3.1 Render locked front/side Doors and gold Keys in the procedural-generation settings preview without mutating preview terrain or settings; verify focused preview tests for Underworld civilization and Overworld Homes.
- [x] 3.2 Replace the Character HUD Key glyph with gold-key artwork while retaining the bridge-fed count and responsive layout; verify focused React character and bridge tests.

## 4. Integrated verification

- [x] 4.1 Run the relevant focused Node tests and `npm.cmd run build`; resolve failures attributable to this change.
- [ ] 4.2 Manually verify a fixed `?randomSeed=locked-door-art` session: collect a gold Key, observe the gold-padlock-over-door locked state, unlock it, enter it on the next action, and inspect Underworld fences, Overworld Homes, preview, and HUD at normal and zoomed views.
- [x] 4.3 Run `openspec validate add-locked-door-states --type change --strict` and confirm every planned artifact remains coherent.

## Correction verification (2026-09-27)

- Locked front and side Doors now compose `golden_lock.png`; collectible Key and HUD retain `golden_key.png`. Preview and world share the same composition helper.
- 68 focused Node tests passed; production build and strict OpenSpec validation passed.
- Manual fixed-seed Home check verified the gold padlock, gold Key pickup (0 to 1), key spend (1 to 0), open art without a padlock, and entry on the following action.
- Task 4.2 remains open for the full Underworld and normal/zoomed cross-surface acceptance sweep.
