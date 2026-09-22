# Proposal

## Why

Log messages are currently assembled by a private `appendLog` closure inside the game-layer index, which makes logging difficult for independent systems to reuse and leaves display policy mixed with game startup state. A dedicated Log System will give every game system one consistent event entry point while allowing the Log System to own formatting, retention, filtering, and delivery to the UI.

The lower-right log also needs predictable reading behavior: new entries should appear at the bottom, continue following the newest entry while the player is at the bottom, and stop moving while the player studies older entries.

## What Changes

- Add a Babylon Lite `log-system` module that accepts log events from any game system.
- Define a consistent event-to-line contract owned by the Log System, including the default single-line rendering format and the policy for events that are not displayed.
- Move current realm, pickup, and other gameplay log production from the game-layer index into Log System calls while removing the redundant `Player` prefix from user-visible messages.
- Expose immutable ordered log-line snapshots through the existing narrow bridge to React.
- Keep the Log UI responsible only for rendering the snapshot and tracking its scroll position; it SHALL append new lines at the bottom of the body.
- Autoscroll to the newest line only when the log body is already at its scrollable bottom. Once the player scrolls upward, new entries SHALL not move the viewport until the player returns to the bottom.
- Preserve the current Log panel location, collapse/expand behavior, styling, bounded retention, and existing line content except for the explicit `Player` prefix removal.
- Add focused Log System, bridge, and UI behavior tests following the mirrored client test layout.

## Capabilities

### New Capabilities

- `log-system`: Provides a reusable game-layer event intake, consistent line formatting/display policy, ordered retention, bridge snapshots, and scroll-aware Log presentation.

### Modified Capabilities

None. The existing game-layer architecture remains the boundary for this new system; the new capability will conform to its narrow bridge and game-owned client rules.

## Impact

- Adds `ascii-rpg/src/client/game-layer-babylon-lite/systems/log-system.js` and its mirrored tests.
- Updates Babylon Lite startup/system wiring, current log-producing gameplay paths, and the existing bridge log snapshot contract.
- Updates the React Log panel and HUD styles only as needed for scroll-position tracking and bottom insertion.
- Adds no dependencies, persistence, network behavior, or public external API.
- No log content should be lost from the current bounded behavior without an explicit retention decision in the design; the current default is to preserve the existing maximum visible history.
