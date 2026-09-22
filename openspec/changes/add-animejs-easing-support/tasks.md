# Tasks

## 1. Dependency and easing surface

- [ ] 1.1 Add and lock the supported `animejs` dependency in the repository root, then verify the package exposes the required easing utilities without changing the existing Babylon Lite version.
- [ ] 1.2 Add the project-owned easing registry with Bezier In/Out presets and adapters for the supported Anime.js easing families; verify named lookup, custom-function lookup, and unknown-name errors with focused Node tests.

## 2. First consumer: realm transition

- [ ] 2.1 Extend the transition primitive to accept independent closing and opening easing functions while preserving the covered hold and lifecycle event order; verify progress values for both phases and the unchanged full-coverage midpoint.
- [ ] 2.2 Configure the realm iris transition to use Bezier Out during closing and Bezier In during opening; verify the realm swap remains hidden until the covered event and opening begins only after the hold.

## 3. Shared animation helper

- [ ] 3.1 Implement the reusable AnimationHelper around the existing frame/animation scheduling boundary with duration validation, normalized progress, completion, and cancellation; verify endpoint and cancellation behavior with injected deterministic frames.
- [ ] 3.2 Add helper adapters for plain-object values and Babylon Lite sprite presentation updates without taking ownership of renderer or React UI lifecycle; verify a sprite-targeted animation updates through the existing game-layer path.

## 4. Future animation adoption

- [ ] 4.1 Route any additional JavaScript-owned client animations touched by this change through AnimationHelper and document CSS-only UI animations as outside the helper boundary; verify no duplicate scheduler updates are introduced.

## 5. Verification

- [ ] 5.1 Run the focused easing, helper, and transition Node tests and verify all pass.
- [ ] 5.2 Run `npm.cmd test` and `npm.cmd run build` from the repository root and verify no existing tests or production bundling regressions.
- [ ] 5.3 Perform manual browser verification at the actual project-root URL: confirm the iris closes with Bezier Out, opens with Bezier In, preserves the 100ms covered hold, keeps React UI visible, and resumes input after completion.
