# Proposal

## Why

The RPG needs a shared world-time concept before future systems such as enemy
movement can react to player actions. A visible, deterministic time counter
establishes that foundation now while keeping advancement tied to the existing
successful player-movement contract.

## What Changes

- Add a Time System whose counter starts at time unit `00001` for a new game.
- Advance the counter by exactly one after each successful cardinal or diagonal
  player move into a different walkable cell.
- Do not advance time for blocked, out-of-bounds, or otherwise unsuccessful
  movement attempts, resize events, palette changes, or other UI actions.
- Display `Time: 00001` beneath `Ascii RPG` in the upper-left corner UI, with
  five decimal digits and leading zero padding as the counter grows.
- Expose only the time state and update notification needed by the UI; do not
  add enemy, turn, scheduling, persistence, or other future-system behavior.

## Capabilities

### New Capabilities

- `time-system`: Provides the initial world-time value, successful-movement
  advancement rule, formatted counter, and UI update behavior.

### Modified Capabilities

- `player-grid-movement`: A successful movement step also emits the event that
  advances the Time System; unsuccessful movement remains non-advancing.

## Impact

- Affected client code includes the Babylon Lite game layer, its narrow UI
  bridge, and the React corner UI in `ascii-rpg/src/`.
- The existing player movement behavior remains unchanged except for the new
  time advancement side effect after a successful move.
- Tests will cover the time state/formatting, movement integration, and visible
  upper-left UI contract.
- No new dependency, storage format, URL argument, network behavior, or
  external API is required.
