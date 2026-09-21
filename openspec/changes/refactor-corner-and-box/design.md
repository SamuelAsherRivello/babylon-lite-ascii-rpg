# Design

## Context

The React HUD currently separates anchoring (`CornerLayout`), generic panel framing (`BoxLayout`), and content blocks (`HudBlockLayout`), but the three target panels use those primitives inconsistently. Character and Map are top-corner overlays sized by `--top-panel-size`; the minimap canvas remains owned and rendered by the game layer. Log is a bottom-right corner containing a second, independently styled box and a special action button that controls its open state.

The refactor must stay within the React UI layer and its imported CSS. It must not move minimap rendering into React, alter bridge snapshots, change local-storage behavior, or change the existing responsive presentation contract.

## Goals / Non-Goals

**Goals:**

- Define one shared panel surface component for Character, Map, and Log.
- Keep anchoring as a parent concern through `CornerLayout`.
- Model action-label placement as a panel prop with the current bottom and top variants.
- Model Log collapse as an opt-in controlled behavior while leaving Character and Map non-collapsible.
- Keep each panel's children and content-specific styles independent.
- Make the shared CSS ownership clear and remove duplicated panel framing rules where safe.

**Non-Goals:**

- Do not redesign the HUD or change visible labels, dimensions, colors, or spacing.
- Do not combine Character, Quest, Map, or Log content components into one content abstraction.
- Do not move `#minimap_canvas` or game-layer rendering into React.
- Do not change the four-corner layout contract, quest placement, minimap zoom behavior, or Log data source.
- Do not add a component library, CSS framework, dependency, persistence setting, or new public runtime API.

## Decisions

1. **Use `BoxLayout` as the shared panel primitive.**

   Extend the existing component rather than introduce a parallel `Panel` abstraction. Its stable responsibilities are the shared surface and action label; its children remain unconstrained React content. The alternative—three separate `CharacterBox`, `MapBox`, and `LogBox` wrappers—would preserve duplication and make later style drift likely.

2. **Keep `CornerLayout` as the anchor owner.**

   `CornerLayout` maps semantic positions to the existing corner classes. Each target panel is rendered inside the appropriate corner, so anchoring does not become a styling prop on the box itself. This preserves the existing bottom-left HUD and editor/window placement behavior.

3. **Make action placement explicit.**

   Retain the existing `action` and `actionPosition` props, with a small documented set of positions (`top` and `bottom`). The Character and Map actions remain non-interactive labels in their current location; Log supplies a button as its action so the same action slot owns its toggle affordance.

4. **Make collapsing controlled and opt-in.**

   Add a controlled `collapsible`/`expanded`/`onToggle` contract, or the smallest equivalent prop set that fits the existing component style. When disabled, the box always renders its children. When enabled, the box keeps its action visible and conditionally renders or hides its body according to `expanded`; the parent retains `logOpen` state and remains responsible for state transitions. The collapsed Log launcher must preserve its current accessible name, `aria-expanded`, and `aria-controls` behavior.

5. **Use shared framing styles plus content modifiers.**

   Move border, background, box sizing, action-label typography, and common interaction rules to the shared box selectors. Keep `.character_*`, map canvas rules, `.log_box_body`, log entry typography, quest styles, and other content-specific selectors in their feature-owned files. The map canvas can fill or align with the shared frame without changing its game-layer ownership.

6. **Preserve the current DOM contracts where they carry behavior.**

   Retain stable IDs and accessibility relationships such as `log_box`, `aria-controls`, `aria-expanded`, `minimap_canvas`, quest labels, and the four corner positions. Update source-level tests only when they need to describe the new shared component contract; retain assertions for current user-visible behavior.

## Risks / Trade-offs

- **[Map canvas and React box can drift geometrically]** → Keep both driven by the existing `--top-panel-size`, shared inset, and explicit corner classes; verify computed layout in landscape and portrait browser checks.
- **[Conditional Log rendering can change focus or hit testing]** → Keep the action mounted and preserve the current button semantics in both expanded and collapsed states; add source checks for the toggle contract.
- **[CSS consolidation can change cascade order]** → Preserve import order and verify the production bundle, existing tests, and visual layout before considering the refactor complete.
- **[Generic props can become over-generalized]** → Limit the shared component API to action placement and opt-in controlled collapse; keep panel content and feature styles separate.

## Migration Plan

1. Update the shared layout component and its focused tests.
2. Refactor the Character, Map, and Log call sites while preserving existing state, content, IDs, and handlers.
3. Consolidate shared HUD box styles and remove only rules made redundant by the shared implementation.
4. Run the existing Node test suite and production build, then manually verify the three panels and Log toggle in supported orientations.

Rollback is a source-only revert of the scoped React/CSS/test changes; no data migration or persisted-state migration is required.
