# Tasks

## 1. Palette data and client store

- [x] 1.1 Add the visible Code Page 437 32–254 mapping plus U+2022 and verify a unit test finds every required identity exactly once.
- [x] 1.2 Define palette entry defaults, validation, customized-status derivation, and JSON serialization; verify invalid color, alpha, identity, and malformed-palette cases are rejected.
- [x] 1.3 Add the shared client palette store and connect world glyph resolution to palette color and alpha; verify `W`, `•`, and `P` resolve the expected default styles.
- [x] 1.4 Add the `react-colorful` dependency and verify the dependency installs and the production bundle resolves it.

## 2. Palette editor UI

- [x] 2.1 Expand `PromptWindow` into a scrollable multi-column palette grid showing only index and styled glyph; verify the grid renders all visible entries with their color and alpha.
- [x] 2.2 Add anchored row editing with the React color picker, controlled alpha range, glyph preview, draft state, Confirm, and Cancel; verify Cancel preserves the saved entry and Confirm commits valid values.
- [x] 2.3 Add the deployed persistence warning after the first unacknowledged Confirm with an unchecked `Hide warning` checkbox; verify the acknowledgment suppresses later warnings in the same browser storage scope.

## 3. Persistence and synchronization

- [x] 3.1 Add the local Vite development-only palette write endpoint with path and payload validation; verify successful writes update the static JSON file and failed writes reject the edit.
- [x] 3.2 Add deployed `localStorage` persistence with fallback to bundled defaults for invalid stored data; verify edits survive reloads and malformed overrides do not break startup.
- [x] 3.3 Add `BroadcastChannel` palette-change notifications; verify local instances refetch the disk-backed file and deployed instances apply the updated `localStorage` value.
- [x] 3.4 Provide a usable fallback when cross-instance notification is unavailable; verify a receiving failure leaves the last valid palette active.

## 4. Renderer integration and verification

- [x] 4.1 Update canvas drawing to apply each glyph's palette color and alpha and restore drawing state between cells; verify mixed-style cells render independently.
- [x] 4.2 Preserve grid placement, movement, terrain walkability, and character-over-terrain precedence; verify existing player-grid and world-grid tests pass with palette styling enabled.
- [x] 4.3 Add focused palette model, editor, persistence, synchronization, and renderer tests; verify `npm.cmd test` passes.
- [x] 4.4 Build and run the Vite app, then verify in a real browser that the visible palette renders with the configured `•` mid-gray and `W` white styles; verify `npm.cmd run build` passes.
