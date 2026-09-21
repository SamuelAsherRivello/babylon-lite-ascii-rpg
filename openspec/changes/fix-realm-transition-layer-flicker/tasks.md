# Tasks

## 1. Reproduce and instrument the covered handoff

- [x] 1.1 Add or extend a focused game-layer test seam that records sprite-layer attachment, removal, addition, and presentation events, and verify it can distinguish the covered midpoint from the opening phase.
- [x] 1.2 Reproduce both stair and Settings realm-transfer paths through the seam, and verify the current regression is represented by an observable detach/attach or blank-presentation ordering.

## 2. Preserve renderer continuity during realm replacement

- [x] 2.1 Update the realm activation path so destination sprite submissions reuse the attached game layer whenever possible, explicitly hiding stale slots before the destination composition, and verify no layer removal occurs during the covered-to-opening handoff.
- [x] 2.2 Handle destination atlas/cache reconciliation without exposing an unattached or empty game presentation, and verify the renderer has an attached destination-capable surface before opening can proceed.
- [x] 2.3 Keep the transition mask opaque until destination rendering and synchronous presentation complete, and verify the first transparent opening update occurs after the destination presentation event.

## 3. Regression and delivery verification

- [ ] 3.1 Verify paired-stair arrival, realm bridge status, input locking, fog isolation, and React UI stacking remain unchanged while the new renderer-continuity assertions pass.
- [ ] 3.2 Run the focused transition and game-layer tests, then run `npm.cmd test` and `npm.cmd run build`; record any environment-limited validation explicitly.
- [ ] 3.3 Manually verify the actual playable project-root URL in both Overground-to-Underground and Underground-to-Overground transfers, including Settings travel, confirming no mid-transition flicker or blank frame.
