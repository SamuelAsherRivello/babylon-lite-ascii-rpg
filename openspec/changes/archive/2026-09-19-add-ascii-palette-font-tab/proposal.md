# Proposal

## Why

The Ascii Palette already lets developers tune glyph color and opacity, but the
rendered character shape is still fixed to one font. A Font tab keeps this
related rendering control in the same developer window while preserving the
existing edit, confirmation, and persistence behavior.

## What Changes

- Add a tab treatment to the `PromptWindow` title: `Ascii Palette` and `/ Font`,
  with the active tab visibly selected.
- Keep the existing glyph palette body under `Ascii Palette`.
- Add a `Font` body with a dropdown containing five configured font choices:
  Monospace, Consolas, Courier New, Lucida Console, and System Monospace.
- Apply a confirmed font choice immediately to the current game's ASCII
  rendering, including glyph atlas/frame regeneration as needed.
- Give font edits Confirm and Cancel behavior matching glyph edits, with a
  reset-to-default option that does not close the window. Confirm saves the
  selected font and closes the Font editor window.
- Persist confirmed font choices to the local static file during Vite
  development and to browser storage in deployed builds.
- Reuse the deployed browser-only warning and unchecked `Hide warning` flow for
  the first unacknowledged font edit.
- Synchronize confirmed font choices across same-origin game instances and
  keep the current valid font when synchronization is unavailable.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `ascii-palette`: Add tabbed palette/font editing, font selection, immediate
  rendering updates, and matching local/deployed persistence behavior.

## Impact

- React `PromptWindow` gains tab state and a font-selection body while keeping
  the existing palette editor and backdrop lifecycle.
- The shared palette/configuration store and Vite persistence middleware gain a
  font setting with validation and synchronization.
- The Babylon Lite game bridge and ASCII atlas creation need to accept a font
  family and rebuild rendered glyph frames when the confirmed font changes.
- Tests and static data gain coverage for the five choices, default/reset
  behavior, persistence modes, warning behavior, synchronization, and live
  rendering updates.
