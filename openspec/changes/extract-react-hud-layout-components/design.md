# Design

## Context

See `proposal.md` for the motivation and preserved user-facing behavior. The React UI layer currently keeps most HUD markup in `App.jsx`, while `style.css` combines viewport placement, panel geometry, text roles, and feature-specific content selectors. The Babylon Lite game layer remains the owner of the game canvas and gameplay state; this refactor is limited to the React presentation layer.

## Goals / Non-Goals

**Goals:**

- Make the three visual layout concepts explicit as small composable React components.
- Keep layout primitives content-agnostic so character, map, quest, status, and settings content can evolve independently.
- Centralize the shared title/body font roles, spacing, alignment, and panel geometry in CSS owned by the UI layer.
- Preserve existing ids, accessibility relationships, event handlers, persistence behavior, responsive rules, and visible copy.

**Non-Goals:**

- No change to the four-corner positions, viewport sizing model, aspect-mode behavior, or game canvas ownership.
- No redesign of character details, minimap rendering, quest data, settings controls, or modal/editor windows.
- No new React or CSS dependency and no migration of state or game-bridge code into a layout component.

## Decisions

### Use one colocated layout module for the shared primitives

Add a small UI-layer module such as `HudLayouts.jsx` beside `App.jsx` and export `CornerLayout`, `BoxLayout`, and `HudBlockLayout` from it. Keeping the primitives in the React UI layer makes their ownership explicit and avoids turning the game layer into a presentation dependency. The alternative of leaving them as inline helpers in `App.jsx` would reduce file count but would keep the layout system coupled to the stateful application component.

### Keep each primitive narrow and slot-based

- `CornerLayout` owns the shared `corner` class and a constrained position variant (`top-left`, `top-right`, `bottom-left`, or `bottom-right`), then renders arbitrary children. It does not know what a corner displays.
- `BoxLayout` owns the common black surface, white border, box sizing, and optional bottom action label. Its content is supplied through `children`; the action label is a separate prop/slot so box-specific content does not need to know how the label is positioned.
- `HudBlockLayout` owns the repeated block structure and renders a title slot plus a body slot. It applies the shared title-font and body-font roles, justification, line spacing, and inter-block spacing while allowing feature content to provide buttons, links, values, or custom children.

The components should merge caller-supplied class names and pass through stable DOM attributes needed by existing tests and accessibility behavior. Existing ids such as `windows_title`, `stats_title`, and `settings_title` remain attached to the corresponding title elements.

### Define typography as named CSS roles

Introduce explicit custom properties for the shared roles, for example `--hud-title-font` and `--hud-body-font`, and keep the existing action-label sizing as a separate box role where the current visual contract requires it. `.hud_block_title` and `.hud_block_body` consume those variables; feature selectors may change color or decoration but must not duplicate the base font, alignment, or spacing rules.

This is preferred over inline font styles because the same roles are shared by multiple blocks and must remain tunable from one stylesheet. It also preserves the existing selected-font inheritance from the UI root.

### Migrate from outside in

Refactor the markup in layers: first replace repeated corner wrappers with `CornerLayout`, then wrap the top panels and other boxed regions with `BoxLayout`, then convert repeated lower-left sections and quest/status groups to `HudBlockLayout`. Keep feature content and state calculations in their current functions. Remove only CSS rules that become duplicate primitive rules; retain feature-specific geometry such as character bars, minimap canvas placement, quest offsets, and lighting-window controls.

### Preserve behavior through source-level and runtime checks

Update the existing structural assertions to recognize the new component/class contract while retaining checks for exact ids, labels, event wiring, and layer boundaries. Run the repository's existing Node test command and production build after the refactor. Manual browser verification should compare landscape and portrait presentations, because CSS inheritance and absolute positioning are the principal regression risks.

## Risks / Trade-offs

- [Risk] Moving wrapper elements can change selector specificity or absolute-position containing blocks. → Keep the primitive DOM wrappers intentional, preserve the existing `corner` positioning context, and verify both aspect modes.
- [Risk] A generic title/body component could erase feature-specific semantics. → Keep ids, `aria-labelledby`, button/link elements, and content-specific classes on caller-provided slots; the primitive supplies only shared structure and roles.
- [Risk] Existing structural tests may overfit implementation class names. → Replace only assertions that describe the old wrapper shape, and retain behavior-oriented checks for labels, controls, accessibility attributes, and layer boundaries.
- [Risk] The working tree already contains unrelated edits. → Scope implementation and test changes to files attributable to this refactor and do not reset, overwrite, or stage unrelated work.

## Migration Plan

1. Add the shared React layout module and its CSS role selectors.
2. Migrate the existing HUD regions incrementally, preserving feature-specific children and attributes.
3. Remove duplicate base layout declarations after each migration and keep specialized rules local to the feature.
4. Update focused structural tests, run the Node checks and build, and manually verify the existing landscape/portrait UI.

Rollback is a scoped revert of the new layout module, its CSS changes, and the associated structural-test updates; no persisted data or external integration migration is required.
