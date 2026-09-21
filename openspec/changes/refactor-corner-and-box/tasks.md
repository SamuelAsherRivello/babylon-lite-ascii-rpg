# Tasks

## 1. Establish the shared panel contract

- [ ] 1.1 Refine `BoxLayout` in `HudLayouts.jsx` into the shared Character/Map/Log panel primitive, preserving its children passthrough, `action`, `actionPosition`, class-name composition, and DOM attributes; verify the component source exposes the intended prop contract.
- [ ] 1.2 Add opt-in controlled collapse support to the shared box, keeping the action mounted and exposing the existing Log accessibility relationships; verify non-collapsible boxes render content unchanged and the collapsible path supports expanded and collapsed states.
- [ ] 1.3 Preserve `CornerLayout` as the anchor primitive and verify the four semantic positions still map to the existing corner classes without changing bottom-left HUD behavior.

## 2. Refactor the three HUD panel instances

- [ ] 2.1 Refactor the Character panel to use the shared box with its existing action label and preserve CharacterDetails, sizing, click/key handlers, and accessibility attributes; verify the Character content and `Character` action remain present.
- [ ] 2.2 Refactor the Map panel to use the shared box framing while keeping minimap canvas rendering and zoom interaction in the game layer; verify `minimap_canvas`, `Map 🔍`, world/floor status, and time output remain intact.
- [ ] 2.3 Refactor the Log panel to use the shared collapse contract with `logOpen` as the controlled state; verify expanded entries, top-positioned Log action, collapsed launcher, `aria-expanded`, and `aria-controls` behavior.
- [ ] 2.4 Keep QuestTracker as independent content beneath the Character panel and verify its title, progress, completion strike-through, and existing spacing remain unchanged.

## 3. Consolidate styles and checks

- [ ] 3.1 Consolidate shared box surface, border, background, sizing, action-label, and focus styles in the HUD stylesheet while retaining Character, Map, Quest, and Log content-specific selectors; verify no redundant Log-only frame rules remain where the shared box owns the behavior.
- [ ] 3.2 Update `ascii-rpg/test/main_tests.mjs` and any focused UI source checks for the shared box and collapse contract while preserving existing assertions for corner anchors, responsive geometry, quest content, minimap behavior, and Log semantics; verify the targeted tests pass.
- [ ] 3.3 Run `npm.cmd test` from the repository root and verify the complete existing test suite passes without changing unrelated dirty files.
- [ ] 3.4 Run `npm.cmd run build` from the repository root and verify the production build succeeds; manually inspect the three panels in landscape and portrait layouts, including Log collapse/expand.
