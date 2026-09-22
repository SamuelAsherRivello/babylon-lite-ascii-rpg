# Tasks

## 1. Generic movement events

- [x] 1.1 Identify the shared successful cardinal movement commit path used by keyboard and swipe input, and verify it is the single point where a moved player cell is accepted.
- [x] 1.2 Add or extend the generic client dispatch/listener surface so successful cardinal movement emits exactly `player moved up`, `player moved down`, `player moved left`, or `player moved right`, and verify blocked and diagonal movement emits no cardinal event.
- [x] 1.3 Keep the game layer free of tutorial imports, progress state, and completion logic, and verify the movement/event tests cover keyboard, swipe, blocked, and diagonal cases.

## 2. Tutorial UI flow

- [x] 2.1 Add React tutorial phases for initial, tracking, complete, and finished, and verify a new page/game session starts in the initial phase without persisted tutorial state.
- [x] 2.2 Add the initial floating How To Play window using the existing Lighting window styling with exact title, instruction, primary `Next`, and secondary `Skip Tutorial` controls below it, with no close button; verify only those actions dismiss it without starting gameplay input.
- [x] 2.3 Subscribe the tutorial only to the four generic player-moved events, track each received cardinal direction after dismissal, and verify the completion window appears immediately after all four events.
- [x] 2.4 Add the completion state using the same `How To Play` window title, matching body and sizing, and the same primary button style with only an `Ok` control, with no close button; guard the transition so duplicate events cannot reopen it, and verify `Ok` finishes the tutorial.
- [x] 2.5 Persist the Skip Tutorial setting with a false default, make it skip the remainder of the current tutorial, and verify a stored true value skips tutorial windows in later sessions.

## 3. Responsive styling and integration

- [x] 3.1 Reuse the Lighting window frame, title-bar, corner typography, and UI input-isolation patterns for both tutorial windows, and verify tutorial controls do not start canvas swipe movement.
- [ ] 3.2 Add compact desktop and mobile portrait/landscape geometry for the tutorial windows, and verify title, instruction or completion content, buttons, and `OK` remain visible without horizontal overflow.
- [ ] 3.3 Update focused structural and client Node coverage for event names, event-only tutorial subscription, exact copy, phase transitions, and responsive markup, and verify `npm.cmd test` passes.

## 4. Verification

- [x] 4.1 Build the Vite project with `npm.cmd run build` and verify the production build succeeds.
- [ ] 4.2 Manually inspect the running game on desktop and mobile-sized presentations: dismiss the first window, move successfully in all four cardinal directions using keyboard and swipe paths, dismiss completion, and verify no tutorial behavior is embedded in gameplay and no window overflows. Do not create or run Playwright tests.
