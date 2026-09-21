# Tasks

## 1. Quest definition and event integration

- [x] 1.1 Add the `Unlock A Door` definition to `quest_data.json` after
  `Collect Gold`, with the exact ordered labels and event criteria, and verify
  the JSON contract test finds all three steps in order.
- [x] 1.2 Wire the quest bootstrap to reconcile the current realm when the
  quest starts, and verify an Underground start immediately completes
  `Enter Underground Realm` without adding a duplicate key request.
- [x] 1.3 Confirm or add the generic door-unlocked gameplay event at the
  existing game-layer event boundary, and verify quest code observes the event
  without taking ownership of door collision or unlock state.

## 2. Quest progression and presentation coverage

- [x] 2.1 Extend quest-system tests for the ordered Underground entry, one key
  pickup, and one door-unlocked event sequence, including ignored unrelated
  events and final completion.
- [x] 2.2 Verify the existing immutable bridge snapshot, HUD tracker, Gameplay
  Settings quest tab, and lifecycle toasts render every catalog quest,
  including the new quest's exact title, labels, progress, and completed state,
  without a separate per-quest UI registration.
- [x] 2.3 Verify Collect Gold still completes and advances to `Unlock A Door`,
  while manually selecting the new quest still resets only runtime progress.
- [x] 2.4 Verify every quest definition in `quest_data.json` appears in the
  Gameplay Settings `Quests` tab, can be selected as Default Quest, persists
  by ID, and restores with fresh runtime progress after refresh.
- [x] 2.5 Add active-step navigation metadata and nearest-target minimap
  resolution, and verify exactly one stairs, key, or door marker follows the
  active quest step.

## 3. Validation and live behavior

- [x] 3.1 Run the focused quest, gameplay-event, realm, pickup, and door tests
  and verify they pass without regressions.
- [x] 3.2 Run `npm.cmd test` and `npm.cmd run build` from the repository root,
  recording any environment-related validation limitation.
- [ ] 3.3 Manually inspect the running app in both initial realms and verify
  the quest tracker shows the correct active step, exactly one closest marker
  targets stairs, key, or door as appropriate, the existing key is counted,
  the door-unlocked event completes the quest, and refresh resets progress.
