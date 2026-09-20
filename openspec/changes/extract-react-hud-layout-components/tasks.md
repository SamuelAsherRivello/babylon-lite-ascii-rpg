# Tasks

## 1. Shared layout primitives

- [x] 1.1 Add the UI-layer React module for `CornerLayout`, `BoxLayout`, and `HudBlockLayout`, with explicit position, content, action-label, title, and body slots, and verify the module exports the three primitives without importing game-layer code.
- [x] 1.2 Add shared CSS roles for corner positioning, box surface/border/action treatment, HUD block spacing/alignment, and title/body font variables, and verify the base rules are defined once in `style.css`.

## 2. HUD migration

- [x] 2.1 Migrate the Character and Minimap regions to `CornerLayout` plus `BoxLayout`, preserving their ids, action labels, click/keyboard handlers, minimap status placement, and existing responsive geometry; verify the rendered source still contains the required labels and handlers.
- [x] 2.2 Migrate quest, world-status, version, Windows, Stats, and Settings presentation to `HudBlockLayout` or the appropriate shared primitive while keeping feature-specific children, accessibility relationships, and state behavior unchanged; verify all existing HUD ids and labels remain present.
- [x] 2.3 Remove duplicate base layout declarations and keep only feature-specific CSS for character bars, minimap details, quest offsets, controls, and editor/window content; verify no migrated region relies on a feature selector for its shared title/body font, spacing, or alignment.

## 3. Verification

- [x] 3.1 Update focused structural tests for the shared component/class contract while retaining checks for the exact HUD labels, ids, accessibility attributes, React/Babylon layer boundary, and title/body font roles; verify `npm.cmd test` passes from `ascii-rpg`.
- [x] 3.2 Build and manually inspect the existing landscape and portrait HUD presentations, including the four corners and editor/window controls, and verify `npm.cmd run build` passes with no page overflow or visible layout regression.
- [x] 3.3 Review the final diff and working-tree status, verify only files attributable to this refactor are included, and leave unrelated user changes untouched.
