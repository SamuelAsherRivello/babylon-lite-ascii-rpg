# Tasks

## 1. Mountain terrain and attack turns

- [x] 1.1 Initialize 100 health only on interior Overground mountains and use
  `▒` for the non-walkable outer border; verify generated terrain tests cover
  interior, border, and unchanged Underground cells.
- [x] 1.2 Resolve movement attempts into interior mountains as one full attack
  turn and convert lethal hits to walkable grass without moving the player;
  verify Offense damage, stamina, world time, attack experience, and next-input
  movement with focused combat and movement tests.

## 2. Damage feedback and world views

- [x] 2.1 Route mountain damage through the Log System, floating-text system,
  and transient health-bar renderer; verify visible damage, clamped values,
  repeated hits, and offscreen suppression with focused Node tests.
- [x] 2.2 Refresh the game view, minimap, map view, and relevant lighting after
  a mountain becomes grass; verify the terrain and walkability update in each
  view and that fog discovery updates when the player later enters the cell.

## 3. Integration verification

- [ ] 3.1 Run `npm test` from the repository root and verify the complete
  existing Node test suite passes with the new focused tests.
- [x] 3.2 Run `npm run build` from the repository root and verify the Vite
  production build succeeds without adding a runtime dependency.
- [ ] 3.3 Manually verify cardinal and diagonal digging, repeated input, the
  lethal-hit stay-in-place rule, the later grass step, feedback, and the
  indestructible `▒` border in a real browser.
