# Tasks

## 1. Core stamina and time behavior

- [ ] 1.1 Add the Babylon Lite stamina system with max/initial `50`, bounded current values, walking cost `1`, sprint cost `2`, and `+10` independent T-tick recovery; verify focused tests cover full, partial, zero, and capped values.
- [ ] 1.2 Integrate movement cost into the shared successful keyboard/canvas path and apply cost before recovery when both events coincide; verify blocked movement has no stamina effect and movement without a T tick drains by the correct amount.
- [ ] 1.3 Integrate Shift sprinting with a centralized faster cadence and the sprint cost; verify sprint movement is faster than walking and does not change the normal walking cost.
- [ ] 1.4 Apply the exhausted cadence when current stamina is `0`: immediate first attempt, then `0.375s` between the second and subsequent attempts; verify normal cadence resumes at stamina `1+`.
- [ ] 1.5 Connect recovery to the HUD Time increment/T-tick event and initialize stamina for each new game/player lifecycle; verify a T tick adds `10` and never exceeds `50`.

## 2. Bridge and HUD presentation

- [ ] 2.1 Extend the authoritative bridge snapshot with current/max stamina and verify startup, movement, sprint, zero, and T-tick updates through focused bridge tests.
- [ ] 2.2 Insert Stamina immediately below Health and preserve the existing three-color current/delta/unfilled transition behavior without numeric text; verify progress-bar accessibility values expose current/max.
- [ ] 2.3 Reduce Character resource/slot boxes from `28px` to hardcoded `22.4px` and verify the five-bar Character box remains usable in landscape and portrait/mobile modes.

## 3. Verification

- [ ] 3.1 Run the repository's existing Node test command from the repository root and verify stamina, movement, sprint, T-tick, bridge, and UI coverage passes without changing unrelated dirty work.
- [ ] 3.2 Run the repository build command and manually verify walking, Shift sprinting, T-tick recovery, zero-stamina cadence, full-bar capping, and the responsive HUD at the configured local Vite URL.
