# Proposal

## Why

The generated world has no durable exploration signal, so players cannot tell
where they have safely travelled once the camera moves away. A small,
responsive minimap makes exploration legible by showing a fog-masked,
downsampled view of the world instead of anonymous coverage brightness.

## What Changes

- Add a session-owned fog-of-war record: every new world starts fogged, and
  only walkable cells reached by the player's lighting-derived, hard
  line-of-sight discovery rule become permanently discovered for that session.
- Add a Babylon Lite-owned upper-right minimap that renders downsampled world
  content at a hard-coded initial 1:10 world-to-minimap scale, with discovery
  coverage as an opacity mask rather than grayscale map content.
- Add a persisted `Minimap` settings checkbox that only toggles minimap
  rendering; it never pauses or clears fog discovery.
- Size the minimap with a hard-coded minimum plus a viewport-relative size so
  it remains usable in desktop landscape and mobile portrait layouts.
- Move the GitHub link from the upper-right HUD position to immediately above
  the lower-left Windows list.

## Capabilities

### New Capabilities

- `fog-of-war-minimap`: Session-scoped exploration discovery and its
  fog-masked, unlit world-content minimap presentation.

### Modified Capabilities

- `game-layer-architecture`: Keep fog state and minimap cell rendering in the
  Babylon Lite layer while React sends only the narrow minimap-visibility
  command.
- `responsive-ui-layout`: Reserve the upper-right HUD area for a responsive
  minimap and relocate project links above the lower-left Windows region.

## Impact

- Affects the Babylon Lite world lifecycle, player-movement refresh path,
  lighting helper reuse, and the minimap's unlit world-content draw path.
- Affects the React Settings control, browser storage, game bridge, HUD CSS,
  and focused world/fog, bridge, UI, and responsive-layout tests.
- Adds no dependencies and does not change terrain generation, collision,
  player movement, or current lighting output.
