# Tasks

## 1. Dev panel and retired HUD visibility setting

- [x] 1.1 Add persisted, default-closed Dev panel state and render the existing lower-left tools through the Log-style lower-left `Dev` panel; verify its launcher, expanded action, local-storage key, and preserved tool IDs in focused source checks.
- [x] 1.2 Remove the Developer checkbox, Show UI state, platform default, startup initialization, and HUD-hidden selectors; verify neither the control nor a saved legacy Show UI value can hide the Dev launcher.

## 2. Dev-specific layout and typography

- [x] 2.1 Add no-scroll Dev body and lower-left panel geometry matching the open Log panel; verify the Dev and Log CSS share the same width and height contract while retaining opposite corner anchors.
- [x] 2.2 Add scoped `developer-title` and `developer-body-text` 8pt styling while retaining existing title/body weights; verify no non-Dev HUD selector inherits the reduced size.

## 3. Verification

- [x] 3.1 Update focused UI and platform-setting source-contract tests for the Dev panel, retired Show UI behavior, persisted default-closed state, and retained developer controls; verify the relevant Node tests pass.
- [ ] 3.2 Run `npm.cmd test` and `npm.cmd run build` from the repository root; verify both complete successfully.
- [x] 3.3 Manually verify the served landscape and portrait UI: Dev starts closed, persists open/closed state, has no scrollbar, matches open Log dimensions, exposes all retained tools, and does not clip required controls.
