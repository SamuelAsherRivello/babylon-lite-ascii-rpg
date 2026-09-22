# Design

## Context

The current renderer draws every world glyph with one hard-coded white canvas
style, while the procedural world stores terrain glyphs and temporary color and
alpha fields independently. The existing `PromptWindow` is the UI entry point
for the palette and the React/Vite app has no server persistence endpoint.

## Goals / Non-Goals

**Goals:**

- Establish one palette data model shared by world generation, the React editor,
  and canvas rendering.
- Provide visible Code Page 437 entries 32–254 plus U+2022 with white/1.0
  defaults and derived customized status.
- Support confirmed edits in local Vite development and deployed browser-only
  use without weakening the static GitHub Pages deployment.
- Update the current game immediately after a successful palette commit.

**Non-Goals:**

- Restricting which glyphs game systems may use.
- Editing glyph identity or code-page mapping from the UI.
- Supporting control-code values 0–31 in the first palette.

## Decisions

- **Palette data shape:** Store entries with a stable identity (`code` for
  Code Page 437 values or `unicode` for U+2022), `glyph`, `color`, and `alpha`.
  Customized status is derived by comparing values with `#ffffff` and `1.0`,
  avoiding a second mutable flag that could drift.
- **Single client source:** Add a small palette store module that owns the
  loaded snapshot, exposes read/subscribe/commit behavior to both React roots,
  and provides the canvas renderer with resolved styles. This avoids relying on
  the browser `storage` event, which does not notify the same document that
  performed the write.
- **Editor controls:** Use `react-colorful` for the color picker and a native
  controlled `<input type="range">` for alpha. The picker and slider edit a
  draft; Confirm commits it and Cancel discards it.
- **Local persistence:** In Vite development, expose a development-only
  endpoint that validates and atomically writes the palette JSON. A failed
  response leaves the committed client snapshot unchanged.
- **Deployed persistence:** In production/static hosting, use `localStorage`
  as the writable layer over the bundled default palette. The first
  unacknowledged Confirm shows the local-only warning; the `Hide warning`
  choice is stored in the same browser scope.
- **Cross-instance synchronization:** Publish a palette-change message through
  `BroadcastChannel`. Local Vite instances refetch the disk-backed JSON after
  receiving the message; deployed instances reload the updated `localStorage`
  value. A receiving instance that cannot load the new snapshot keeps its
  current valid palette and reports the failure locally.
- **Rendering:** Resolve the visible character first, then obtain its palette
  style and set canvas `fillStyle` and `globalAlpha` for that cell. Restore the
  default alpha after each draw so one transparent glyph cannot affect later
  cells.
- **Mapping boundary:** Keep the CP437-to-Unicode mapping static and
  read-only. The editor changes appearance only, not the identity or glyph
  mapping.

## Risks / Trade-offs

- [The bundled palette and localStorage override can diverge] -> Validate the
  stored schema on load and fall back to the bundled defaults when invalid.
- [A local write endpoint adds a development-only server surface] -> Register
  it only when Vite is running in development and reject paths outside the
  palette file.
- [A large 224-entry table may be visually dense] -> Use a scrollable table,
  compact rows, and an anchored editor rather than rendering a separate editor
  for every entry.
- [Color picker dependency increases bundle size] -> Use the small,
  tree-shakeable `react-colorful` components and import only the required
  picker.
- [A receiving tab may be on an older browser without `BroadcastChannel`] ->
  Keep the current-tab update authoritative and provide manual refresh as the
  fallback; do not block palette editing.

## Migration Plan

Create the default palette JSON from the current `W`, `•`, and `P` glyphs, with
all other visible entries at white/1.0. Load it before world creation, then
replace terrain-local styling and hard-coded canvas styling with palette lookup.
Existing saved browser fullscreen preferences remain unchanged. If a palette
override is invalid or the local endpoint is unavailable, retain the previous
client snapshot and report the failure.

## Open Questions

None for the current scope.
