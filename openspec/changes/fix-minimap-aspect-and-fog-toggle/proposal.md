# Proposal

## Why

The minimap currently stretches world cells when the game viewport and world aspect ratios differ, making the map composition misleading. Fog-of-war is also no longer controllable from the settings surface, so players cannot choose whether undiscovered areas are hidden.

## What Changes

- Render the minimap with uniform cell geometry and aspect-ratio-aware letterboxing/cropping so world proportions remain correct for landscape and portrait layouts.
- Add a persisted `Fog (Checkbox)` setting, enabled by default.
- Apply the fog setting to minimap world and marker visibility without changing the game world's discovery state.
- Restore the fogged appearance when the setting is enabled and show discovered content normally when disabled.

## Capabilities

### New Capabilities
- `minimap-fog-setting`: User-controllable, persisted minimap fog-of-war visibility.

### Modified Capabilities
- None.

## Impact

- React settings state, localStorage reset/persistence, bridge snapshots, minimap rendering, and focused runtime/UI tests.
- No new dependencies or changes to world generation, discovery, or game zoom behavior.
