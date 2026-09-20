# Tasks

## 1. Reproduce and isolate the freeze

- [x] 1.1 Add a focused diagnostic path for the three Windows launchers that records the click, React render completion, browser console errors, long tasks, and game-layer/bridge activity; verify it distinguishes a UI deadlock from a renderer or hit-testing failure.
- [x] 1.2 Reproduce Ascii Settings, Arguments, and Lighting clicks from a fresh browser session and from reset settings; verify the first failing transition and preserve unrelated dirty-work boundaries.

## 2. Repair the shared interaction path

- [x] 2.1 Fix the identified shared freeze trigger without changing the existing window contracts; verify each launcher opens promptly and the game remains responsive.
- [x] 2.2 Verify Ascii Settings close control and backdrop behavior, including repeated open/close cycles and glyph-editor interaction, with a focused UI/runtime check.
- [x] 2.3 Verify Arguments close control and backdrop behavior, including repeated open/close cycles and URL-argument controls, with a focused UI/runtime check.
- [x] 2.4 Verify Lighting mount, title-bar drag, controls, close, and reopen behavior, including saved position and lighting values, with focused checks.
- [x] 2.5 Verify pointer stacking and responsive layout in landscape and portrait modes; confirm UI controls receive input without making canvas gameplay unreachable.

## 3. Regression and delivery verification

- [x] 3.1 Add or update the narrowest permitted source/runtime tests for the discovered failure and verify they pass without modifying Playwright test files unless an approved browser-test command is introduced.
- [x] 3.2 Run the existing Node test suite and record unrelated pre-existing failures separately from this change; verify the focused Windows checks pass.
- [x] 3.3 Run `npm.cmd run build`, `git diff --check`, and `openspec validate --change fix-windows-buttons`; verify the production build and change artifacts are valid.
- [x] 3.4 Manually verify all three Windows buttons open, function, close, and reopen repeatedly in the actual local app URL; verify the browser remains responsive after every cycle.
