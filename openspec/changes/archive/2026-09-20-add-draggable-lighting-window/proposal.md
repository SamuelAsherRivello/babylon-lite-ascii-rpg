# Proposal

## Why

The lower-left Settings corner currently mixes general preferences with every
lighting control, making the HUD taller and forcing players to keep lighting
controls visible when they only need them occasionally. A movable Lighting
window keeps the compact HUD focused while letting players leave lighting
adjustments open during play.

## What Changes

- Rename the existing lower-left `Windows` section to `Windows - 1` and add a
  `Windows - 2` section directly beneath it containing only the `Lighting`
  launcher.
- Add a small, non-modal Lighting window that opens from that launcher and can
  remain open while the game continues to run.
- Put every existing lighting control in the window: GPU Light Pass, Torch
  Lighting, Torch Shadow, Player Lighting, Player GPU Shadow Bleed Range,
  Player Shadow, and Light Ambient.
- Shorten the window labels by removing the redundant `Lighting` prefix and
  the `Light` prefix from Ambient, then order the controls alphabetically.
- Render the window title and its controls with the same shared corner title
  and body text styling as the lower-left HUD.
- Allow pointer dragging from the Lighting window title bar and provide a
  close action that the player may use at any time; closing changes only the
  window's visibility, not the selected lighting values.
- Keep current lighting values, actions, accessibility labels, local-storage
  persistence, reset behavior, and game-layer bridge updates unchanged.

## Capabilities

### New Capabilities

- `draggable-lighting-window`: Provides a persistent-on-page, movable control
  window for the existing lighting settings.

### Modified Capabilities

- `responsive-ui-layout`: Extends responsive window geometry to cover the
  movable Lighting window at desktop and mobile viewport sizes.
- `settings-tooltips`: Moves lighting control help from the lower-left Settings
  section into the Lighting window while preserving its behavior.

## Impact

- Affected React UI: `ascii-rpg/src/client/ui-layer-react/App.jsx`.
- Affected UI styling: `ascii-rpg/src/client/ui-layer-react/style.css`.
- Affected focused structural coverage: `ascii-rpg/test/main_tests.mjs`.
- No game-layer API, dependency, palette, save-data, or lighting-profile
  changes are expected.
