# Tasks

## 1. Core stamina and time behavior

- [x] 1.1 Revise the Babylon Lite stamina system to remove walking/sprinting costs, add a `25`-point resolved enemy-attack cost, retain max/initial `50`, and retain `+10` movement-T-tick recovery with bounded values.
- [x] 1.2 Remove stamina spending from the shared successful keyboard/canvas movement path; verify blocked movement has no stamina or time effect and successful movement recovers without a prior cost.
- [x] 1.3 Preserve Shift sprinting's centralized `100/3ms` later-repeat cadence without a sprint stamina cost; verify sprint movement remains faster than walking.
- [x] 1.4 Multiply the active later-repeat interval by `3` at stamina `0`: `375ms` walking and `100ms` sprinting after an immediate first attempt; verify normal cadence resumes at stamina `1+`.
- [x] 1.5 Keep recovery connected only to each successful movement's HUD Time increment and initialize stamina for each new game/player lifecycle; verify the movement T tick adds `10` and never exceeds `50`.
- [x] 1.6 Spend `25` stamina exactly once when a player attack resolves against an enemy target; verify stale/non-combat collisions cost nothing and low-stamina attacks clamp to zero without being blocked.

## 2. Bridge and HUD presentation

- [x] 2.1 Extend the authoritative bridge snapshot with current/max stamina and verify startup, movement, sprint, zero, and T-tick updates through focused bridge tests.
- [x] 2.2 Insert Stamina immediately below Health and preserve the existing three-color current/delta/unfilled transition behavior without numeric text; verify progress-bar accessibility values expose current/max.
- [x] 2.3 Reduce Character resource/slot boxes from `28px` to hardcoded `22.4px` and verify the five-bar Character box remains usable in landscape and portrait/mobile modes.
- [x] 2.4 Render every Character bar from model-supplied normalized percentages with current/delta/unfilled shades derived from its target color; keep nominal values out of generic percentage math, preserve gameplay accessibility maximums, and show Stamina's initial nominal `50/50` snapshot as half solid and half dark.

## 3. Verification

- [x] 3.1 Run the repository's existing Node test command from the repository root and verify attack spending, free movement, sprint cadence, movement-T-tick recovery, bridge, and UI coverage passes without changing unrelated dirty work.
- [x] 3.2 Run the repository build command; manually verify walking, Shift sprinting, T-tick recovery, full-bar capping, and the responsive HUD at the configured local Vite URL; verify zero-stamina cadence through the focused movement tests.
- [x] 3.3 Add focused coverage for visual capacity, transient deltas, and color derivation; run the full Node suite and production build, then manually verify the half-filled initial Stamina bar and a movement delta.
- [x] 3.4 Run the production build and manually verify movement recovery and the attack-cost delta when an enemy target is reachable at the configured local Vite URL.
