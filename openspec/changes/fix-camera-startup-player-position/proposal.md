# Proposal

## Why

The game can render its first world frame with the player away from the
screen center, then reposition the view after the first input. This makes the
selected camera mode appear to change startup placement and produces a visible
camera snap. Startup placement needs to be deterministic and independent of
the later camera-follow behavior.

## What Changes

- Center the player's screen cell before the first visible world render for
  every persisted camera mode: Center, Deadzone, and Lock.
- Keep each selected camera mode's existing movement behavior after startup.
- Make the startup origin resolution explicit and separate from movement and
  resize/zoom origin resolution.
- Add regression coverage that restarts the game in each mode, verifies the
  initial player position, applies one valid movement input, and verifies a
  one-cell world-position delta.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `camera-modes`: Define the initial player placement as screen-centered for
  all camera modes before mode-specific movement behavior begins.

## Impact

- Babylon Lite startup camera-origin calculation in the player-grid/client
  modules.
- Existing camera-mode tests and startup/movement regression coverage.
- No new dependencies, public APIs, storage keys, or UI controls.
