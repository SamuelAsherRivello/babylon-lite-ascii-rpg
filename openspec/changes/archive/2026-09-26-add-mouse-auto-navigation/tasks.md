# Tasks

## 1. Bounded navigation resolution

- [x] 1.1 Revise game-layer helpers so only the exact occupancy-aware mouse cell can become a target and a cardinal next step uses a maximum of 50 movement steps; verify focused Node tests cover direct targets, invalid-target rejection, and over-limit rejection.
- [x] 1.2 Define the automatic-navigation availability predicate for terrain, active static objects, buildings, closed doors, chests, and dynamic occupants while exempting the player source cell; verify focused Node tests show that manual contact rules are not changed.

## 2. Mouse input and reticle presentation

- [x] 2.1 Map unobstructed canvas mouse coordinates to current visible world cells and render/dispose one four-corner 50-percent-opacity reticle at the exact pointer cell: white for valid and red for invalid; verify focused tests cover valid, invalid, over-limit, resize, and UI-excluded pointer cases.
- [x] 2.2 Reject primary and secondary mouse input whenever the exact pointer cell is invalid, while retaining existing valid auto-walk/auto-sprint behavior and playable-canvas context-menu suppression; verify focused input tests cover valid start, invalid rejection, release, capture loss, gameplay locks, and manual keyboard/swipe behavior.
- [x] 2.3 Revalidate the bounded route before each automatic step and reroute around changed terrain, static occupancy, or dynamic occupants without contact actions; verify focused tests cover a changed next cell, a valid reroute, and an over-limit/no-route stop.

## 3. Integrated validation

- [x] 3.1 Run the revised focused mouse-navigation and existing player-grid/input-controller Node tests, then run `npm.cmd test`, `npm.cmd run build`, and `openspec validate add-mouse-auto-navigation --strict`; retain unrelated worktree changes.
- [x] 3.2 Manually verify in a browser with an explicit `randomSeed` that white exact-cell targets move, red invalid exact-cell reticles reject both buttons, valid routes detour only within 50 steps, dynamic/static blockers reroute without contact, and HUD interaction does not start navigation.
