# Tasks

## 1. Bounded navigation resolution

- [ ] 1.1 Add game-layer helpers that resolve an occupancy-aware available mouse destination and a cardinal next step using a maximum of 50 movement steps; verify focused Node tests cover direct targets, non-walkable fallback ranking, over-limit rejection, and deterministic ties.
- [ ] 1.2 Define the automatic-navigation availability predicate for terrain, active static objects, buildings, closed doors, chests, and dynamic occupants while exempting the player source cell; verify focused Node tests show that manual contact rules are not changed.

## 2. Mouse input and reticle presentation

- [ ] 2.1 Map unobstructed canvas mouse coordinates to current visible world cells and render/dispose the single four-corner white 50-percent-opacity reticle at the resolved target; verify focused rendering/input tests cover valid, fallback, unavailable, resize, and UI-excluded pointer cases.
- [ ] 2.2 Add primary-button auto-walk and secondary-button auto-sprint held input through the existing repeat and ordinary movement path, suppress the playable-canvas context menu, and consolidate duplicate pointer bindings; verify focused input tests cover start, release, capture loss, gameplay locks, and existing manual keyboard/swipe behavior.
- [ ] 2.3 Revalidate the bounded route before each automatic step and reroute around changed terrain, static occupancy, or dynamic occupants without contact actions; verify focused tests cover a changed next cell, a valid reroute, and an over-limit/no-route stop.

## 3. Integrated validation

- [ ] 3.1 Run the focused mouse-navigation and existing player-grid/input-controller Node tests, then run `npm.cmd test`, `npm.cmd run build`, and `openspec validate add-mouse-auto-navigation --strict`; retain unrelated worktree changes.
- [ ] 3.2 Manually verify in a browser with an explicit `randomSeed` that the white corner reticle follows resolved canvas targets, left hold walks, right hold sprints, routes detour only within 50 steps, dynamic/static blockers reroute without contact, and HUD interaction does not start navigation.
