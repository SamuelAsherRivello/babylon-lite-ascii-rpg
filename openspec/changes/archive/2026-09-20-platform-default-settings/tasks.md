# Tasks

## 1. Platform-aware settings initialization

- [x] 1.1 Add a coarse-primary-pointer platform classifier and a shared PC/Mobile default source in the React UI layer; verify that PC resolves the current values while Mobile differs only at Zoom `7` and Show UI off.
- [x] 1.2 Route the existing zoom and boolean setting readers through the platform-aware defaults without changing storage keys, clamping, bridge snapshots, or saved-value precedence; verify reset/reload reselects the current platform defaults.
- [x] 1.3 Update focused Node coverage for platform classification and absent-versus-saved Zoom and Show UI values; verify the targeted Node tests pass.

## 2. Mobile fullscreen entry

- [x] 2.1 Add a Mobile-only, document-level one-shot post-load click handler that requests fullscreen once without preventing or stopping the triggering click; verify PC never auto-requests fullscreen and a rejected request is not retried before reload.
- [x] 2.2 Preserve the manual Fullscreen control and fullscreen state synchronization alongside the automatic mobile attempt; verify it still enters/exits fullscreen normally when supported.

## 3. Integration verification

- [x] 3.1 Run `npm.cmd test` from the repository root and resolve any failures.
- [x] 3.2 Run `npm.cmd run build` from the repository root and verify Vite completes successfully.
- [x] 3.3 Manually verify a clean-storage PC session and a Mobile-emulated session: confirm their initial Zoom/HUD values, saved-value precedence, Reset Settings behavior, and the one automatic Mobile fullscreen request while the first click still performs its normal action.
