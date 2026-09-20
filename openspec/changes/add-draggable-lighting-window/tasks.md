# Tasks

## 1. Lighting window UI

- [x] 1.1 Rename the existing lower-left window section `Windows - 1` and add `Windows - 2` directly below it with only a `Lighting` launcher that opens and closes a non-modal Lighting window; verified the window can be reopened after closing.
- [x] 1.2 Move the existing GPU Light Pass, source lighting, source shadow, Player GPU Shadow Bleed Range, and ambient controls into the Lighting window without changing their values, persistence keys, bridge snapshots, or reset behavior; verified the alphabetic order is Ambient, GPU Light Pass, Player, Player GPU Shadow Bleed Range, Player Shadow, Torch, Torch Shadow.
- [x] 1.3 Implement title-bar-only pointer dragging with viewport-bound placement and resize clamping; verified the body controls do not start a drag and the window header and close action remain reachable at viewport edges.

## 2. Styling and accessibility

- [x] 2.1 Add compact non-modal Lighting window styles that reuse `corner_title` for its title and `corner_body` for its controls; verified it remains legible without a backdrop while gameplay remains interactive.
- [x] 2.2 Keep lighting help text and accessible descriptions with their moved controls, and add an accessible close action; verified hover help remains readable at narrow widths and disabled Ambient actions still expose their descriptions.

## 3. Verification

- [x] 3.1 Update focused Node structural coverage for the Lighting launcher, movable window, relocated controls, close action, shared corner text classes, and reachability rules; `npm.cmd test` passes.
- [x] 3.2 Build the Vite project with `npm.cmd run build`; verified the production build succeeds.
- [x] 3.3 Manually inspect the running desktop and mobile-sized game: opened, dragged, adjusted, left open, closed, and reopened Lighting; verified controls persist through reload and no HUD or window overflow occurs. No Playwright tests were created or run.
