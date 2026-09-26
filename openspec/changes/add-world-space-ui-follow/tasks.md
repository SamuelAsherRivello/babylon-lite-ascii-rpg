# Tasks

## 1. Health-bar world-space anchoring

- [ ] 1.1 Update the active health-bar render path to resolve each bar's anchor, visible-region check, fog check, and sprite geometry from the associated entity's current occupancy cell; verify an unmatched entity produces no visible stale bar.
- [ ] 1.2 Preserve the existing health-bar damage-derived fill, delta, and timing state while the associated enemy moves; verify no movement path writes or resets that presentation state.

## 2. Focused regression coverage

- [ ] 2.1 Extend focused health-bar renderer or integration coverage with an active damaged enemy that moves between cells, verifying the overlay uses the new cell center and retains its health-derived visual values.
- [ ] 2.2 Run the focused health-bar Node tests and verify all timing, geometry, visibility, and moving-anchor assertions pass.

## 3. Integration verification

- [ ] 3.1 Run `npm.cmd test` and `npm.cmd run build` from the repository root and verify both checks pass.
- [ ] 3.2 Manually verify a seeded browser session in which a damaged enemy moves before its health bar expires, confirming that the bar follows the enemy and preserves its existing fade, fill, and delta behavior.
