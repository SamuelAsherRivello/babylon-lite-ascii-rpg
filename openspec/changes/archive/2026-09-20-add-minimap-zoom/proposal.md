# Proposal

## Why

The exploration minimap is currently display-only, so players cannot resize it to their preferred scale. The selected minimap scale must survive a browser refresh without changing the game camera.

## What Changes

- Make the visible exploration minimap interactive: a click anywhere on it cycles its own scale through `1`, `5`, and `10`.
- Wrap the cycle from `10` back to `1`, keeping repeated clicks useful.
- Persist and restore the selected minimap scale after a browser refresh.
- Keep the game camera zoom and its Settings control unchanged, and do not display a minimap zoom number or add a minimap zoom control.

## Capabilities

### New Capabilities

- `minimap-zoom-interaction`: Defines clickable, persisted minimap-only scale cycling without an on-screen zoom value.

### Modified Capabilities

<!-- None. -->

## Impact

- Affects the Babylon game-layer minimap canvas and a dedicated minimap-scale bridge snapshot.
- Updates focused Node tests for minimap scale persistence and input.
- Adds no dependencies, public APIs, or network behavior.
