# Tasks

## 1. Time state and bridge

- [x] 1.1 Add a focused Time System module or equivalent client contract for a numeric initial value of `1`, one-unit advancement, and minimum five-digit formatting; verify unit coverage for `1`, incrementing, blocked/no-op behavior, and values above `99999`.
- [x] 1.2 Extend the game bridge with a current-time snapshot and subscription/update lifecycle that supports React and future non-React consumers; verify subscribers receive initial and incremented values and are cleaned up on disposal.

## 2. Game-layer integration

- [x] 2.1 Initialize world time with each `startGameLayer` game instance and advance it only after a successful player-cell change; verify cardinal, diagonal, held-repeat, wall, and boundary movement cases.
- [x] 2.2 Publish the new time after each successful move without changing existing player rendering or movement repeat behavior; verify the existing game-layer and bridge tests remain green.

## 3. Corner UI

- [x] 3.1 Add `Time: 00001` beneath `Ascii RPG` in the upper-left corner and subscribe it to the bridge snapshot using the existing UI state conventions; verify the initial markup and accessible text contract.
- [x] 3.2 Update the displayed value after successful movement while preserving the four corner roles and responsive styling; verify blocked movement leaves the displayed value unchanged.

## 4. Verification

- [x] 4.1 Add or update focused Node tests for time formatting, movement integration, bridge updates, and UI contract, then verify they pass from the repository root.
- [x] 4.2 Run the repository's complete test command, production build, `git diff --check`, and OpenSpec strict validation for `add-time-system`; manually verify the browser shows `Time: 00001` and increments once per successful move.
