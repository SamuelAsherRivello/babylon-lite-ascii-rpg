# Tasks

## 1. Font model and persistence

- [x] 1.1 Add the validated five-font catalog, stable ids, CSS fallback stacks,
  default selection, and compatibility parsing for missing font data.
- [x] 1.2 Extend the shared runtime store with get/subscribe/commit/reset font
  operations and validate malformed or unsupported persisted values.
- [x] 1.3 Extend the local Vite persistence middleware to write the selected
  font atomically and reject invalid or failed writes without changing runtime
  state.
- [x] 1.4 Add deployed browser persistence, the existing warning acknowledgment,
  BroadcastChannel notifications, and storage-event fallback for font changes.

## 2. PromptWindow Font tab

- [x] 2.1 Add the `Ascii Palette` and `/ Font` title tabs with selected
  treatment, preserving the existing window close/backdrop behavior and palette
  filter/sort state.
- [x] 2.2 Add the five-option font dropdown with current-value selection and a
  staged draft that does not commit on selection alone.
- [x] 2.3 Add Confirm, Reset, and Cancel behavior for font drafts; close the
  Font editor window after Confirm and show the deployed warning when required.
- [x] 2.4 Add focused React/UI tests for tab switching, exact options, draft
  lifecycle, reset behavior, warning behavior, and palette regression safety.

## 3. Babylon Lite rendering integration

- [x] 3.1 Extend glyph frame creation and the game bridge to use the validated
  selected font and to rebuild the atlas safely after a confirmed change.
- [x] 3.2 Preserve glyph color/alpha, world placement, movement, collision, and
  renderer cleanup across repeated font changes.
- [x] 3.3 Add focused renderer and bridge tests proving immediate updates,
  repeated changes, invalid-font rejection, and fallback to the default font.

## 4. Verification

- [x] 4.1 Run the complete Node test suite and validate all OpenSpec artifacts.
- [x] 4.2 Run the production build and inspect the Font tab in a real browser.
- [x] 4.3 Verify local Vite persistence updates the static file and deployed
  browser persistence shows the warning and survives the intended browser
  lifetime.
- [x] 4.4 Verify two same-origin instances synchronize confirmed font changes
  and remain usable when notification delivery or reload fails.
