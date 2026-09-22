# Design

## Context

The React UI currently imports `ascii-rpg/src/client/ui-layer-react/style.css`. The stylesheet has already been made import-aware, but its feature files do not yet match the requested ownership model. See `proposal.md` for the motivation and final file contract; the implementation will rename the entry point to `styles.css`.

## Goals / Non-Goals

**Goals:**

- Keep `style.css` as the only application-level CSS import.
- Make the six-file ownership model obvious from filenames and selectors.
- Preserve CSS cascade order, responsive behavior, animations, and visual output.
- Keep stylesheet tests able to inspect the complete CSS bundle.

**Non-Goals:**

- No redesign, selector renaming, component restructuring, dependency change, or CSS methodology migration.
- No change to React, Babylon Lite, bridge-layer, or client behavior.
- No new CSS variables beyond the existing set.

## Decisions

1. **Use six semantic files.** `character.css` owns character details, bars, slots, and resources; `map.css` owns the canvas, transition mask, minimap, and presentation frame; `hud.css` owns corners, HUD blocks, quest status, settings, links, and zoom controls; `windows.css` owns modal/editor window surfaces and their controls; `toasts.css` owns toast layout and animation; `styles.css` owns variables, document defaults, imports, and genuinely shared catch-all rules.

2. **Retain one entry point.** `main.jsx` imports `./client/ui-layer-react/styles.css`. The entry file imports the five feature files in a deliberate order, avoiding multiple application imports and preserving the existing bundling path.

3. **Move rules by ownership, not by component file.** CSS selectors remain unchanged. Rules that span multiple UI elements stay in `styles.css` unless they are clearly part of a named area. This avoids introducing a new naming convention during a refactor.

4. **Update source-level test loading.** The main stylesheet tests will read the entry stylesheet and its five imported files as one logical bundle. This keeps the tests focused on CSS contracts rather than requiring each rule to remain in one physical file.

5. **Use direct file replacement for the provisional split.** The existing `game-layer.css`, `ui-feedback.css`, and `palette-editor.css` files will be replaced by the requested names and ownership boundaries; `windows.css` remains the window-owned file, and toast rules move to `toasts.css`.

## Risks / Trade-offs

- **[Cascade changes during moves]** → Preserve the existing relative rule order within each ownership group, keep import order explicit, and verify with the full test suite and production build.
- **[A selector fits more than one category]** → Keep shared selectors in `styles.css` and document the ownership boundary in file headers rather than duplicating rules.
- **[Tests become coupled to the file list]** → Keep the file list centralized in the existing stylesheet test helper so future additions have one obvious update point.
