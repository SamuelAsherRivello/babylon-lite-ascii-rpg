# Proposal

## Why

The recovery menu currently appears as soon as health reaches zero, covering the hero before the player can read the complete death animation. A short, deterministic pause after that animation will make death legible while keeping the run safely stopped.

## What Changes

- Immediately lock gameplay input and simulation when the authoritative player-death transition occurs, while leaving React UI controls operational.
- Play the existing hero death animation to its frozen final frame.
- After the animation completes, wait exactly 500 ms before publishing the recovery-menu state.
- Show the existing non-dismissable `Adventure` recovery window and preserve its checkpoint and fresh-game restart actions.
- Keep restarts unavailable until the recovery menu is visible, and cancel any pending recovery delay on teardown or a new game session.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `player-lifecycle`: Stage the terminal player-death presentation so gameplay locks immediately, the death animation completes, and the recovery prompt becomes available only after its additional 500 ms delay.

## Impact

- Affected Babylon Lite player lifecycle, hero-animation completion handling, bridge snapshot semantics, React death-window visibility, and focused lifecycle/UI tests.
- No dependencies, persistence format, restart labels, checkpoint behavior, or non-player gameplay rules change.
