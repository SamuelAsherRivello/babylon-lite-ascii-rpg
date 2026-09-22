# Tasks

## 1. Establish owned randomized artwork

- [x] 1.1 Copy the supplied Mossy torch-lit ruins and subtle chained-brick dungeon PNGs into the existing letterbox asset folder and verify both are present as local project assets.
- [x] 1.2 Add one random layout selection during application bootstrap and verify one selection remains stable for the page lifetime.

## 2. Connect the existing presentation styling

- [x] 2.1 Point the existing backdrop rule at the selected local layout while preserving its rail, border, shadow, filter, frame, and pointer-event declarations; verify no unrelated composition rule changes.

## 3. Verify the feature

- [ ] 3.1 Update focused Node/source checks for both owned assets, load-only random selection, and existing desktop/mobile eligibility; verify the affected tests pass without Playwright.
- [ ] 3.2 Run `npm.cmd test` and `npm.cmd run build` from the repository root and distinguish unrelated pre-existing failures if present.
- [ ] 3.3 Manually verify desktop Portrait renders a new layout after refresh and preserves it through Aspect, fullscreen, HUD, and viewport state changes; verify mobile Portrait remains edge-to-edge with no letterbox.
