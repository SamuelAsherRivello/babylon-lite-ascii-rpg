# Design

## Context

The existing `PromptWindow` owns the Ascii Palette table, anchored glyph
editor, warning dialog, and palette view state. Palette values flow through
the shared palette store to the React UI and the Babylon Lite game bridge.
Glyph frames are currently created with a fixed `monospace` canvas font, while
the Vite middleware persists palette JSON and deployed builds persist through
browser storage.

## Goals / Non-Goals

**Goals:**

- Add a tabbed presentation without changing the existing palette table or
  window/backdrop lifecycle.
- Keep one validated font catalog with exactly five choices and one default.
- Stage font selection independently from the saved value, live-preview the
  rendering, then persist it after Confirm and close the Font editor window.
- Reuse the existing local Vite write path, browser warning, browser storage,
  and same-origin notification model.
- Rebuild the Babylon Lite glyph atlas and redraw the current world when the
  confirmed font changes.

**Non-Goals:**

- Loading arbitrary remote fonts or adding a web-font download system.
- Letting developers type arbitrary CSS font-family strings in the UI.
- Changing glyph identity, palette color/alpha semantics, filters, sorting, or
  the fullscreen/settings behavior.
- Persisting the selected tab, filter, or sort across a browser refresh.

## Decisions

- **Shared font catalog:** Add a read-only catalog containing the five labels,
  CSS font-family values, and the default. The dropdown stores the stable
  catalog id rather than a display label or arbitrary CSS string. This keeps
  local JSON and browser storage easy to validate. An editable text field was
  rejected because it would allow unsupported or unsafe CSS input.
- **Configuration boundary:** Store the selected font in the same validated
  client configuration flow as palette entries, while preserving backward
  compatibility with existing palette files that contain only entries. A
  separate font file is preferred if the current JSON shape cannot safely be
  extended without migration; the implementation task must choose one stable
  schema and cover the migration in tests.
- **React ownership:** Keep tab selection, staged font draft, Confirm/Cancel,
  Reset, and warning presentation in `PromptWindow`. The store owns the saved
  font and persistence; React does not reach into the Babylon renderer.
- **Game-layer update:** Extend the narrow game bridge with a validated font
  update. Recreate the glyph atlas from the five configured font-family values
  and redraw all visible cells after a successful commit. Palette color and
  alpha remain independent of font changes.
- **Persistence and notification:** Reuse the Vite development-only write
  endpoint, browser storage key space, BroadcastChannel, and storage-event
  fallback used by palette edits. A failed local write or malformed remote
  value leaves the last valid font active. The existing warning acknowledgment
  controls both glyph and font edits.
- **Draft preview:** Send a validated draft font through the game bridge and
  BroadcastChannel without writing it to disk or browser storage. Cancel
  broadcasts the saved font to roll back every open instance; Confirm persists
  the already-previewed font and leaves the window open.

## Risks / Trade-offs

- [A font change requires recreating GPU-backed glyph frames] -> Dispose the
  old atlas only after the replacement is ready, keep the renderer and cell
  indexes stable where possible, and test repeated font changes.
- [A deployed browser may not have all five named fonts installed] -> Use CSS
  fallback stacks and display the configured label; the browser chooses the
  first available face without making the app unusable.
- [Existing palette JSON may use an entries-only schema] -> Validate both the
  old shape and the new configuration shape during migration, defaulting the
  font when it is absent.
- [Cross-instance notification can arrive while a local write is in flight] ->
  serialize commits and ignore invalid or stale incoming configuration rather
  than replacing a valid local value with partial state.

## Migration Plan

1. Introduce the validated font catalog and default without changing existing
   palette values.
2. Load the default font when no persisted font exists; preserve existing
   palette-only files through a compatibility path.
3. Add the Font tab, staged editor, persistence, warning, and synchronization.
4. Update the game bridge and atlas lifecycle, then verify repeated confirmed
   font changes and Cancel/Reset behavior.
5. If rollback is required, remove the Font tab and ignore the optional font
   setting while retaining the existing palette entries and default `monospace`
   renderer behavior.

## Open Questions

None for the current scope; the implementation may choose the safest stable
JSON layout between an extended palette configuration and a companion font
file, provided the compatibility and persistence requirements are preserved.
