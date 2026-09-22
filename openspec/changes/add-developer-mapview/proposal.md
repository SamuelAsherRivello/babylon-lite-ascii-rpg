# Proposal

## Why

Developers need a quick way to inspect the generated realm layout, item distribution, and enemy/spawner distribution without walking the player through fogged terrain. The existing minimap is intentionally player-facing and fog-aware, so a separate diagnostic mapview is needed.

## What Changes

- Add a `Map` option under the lower-left Info section in Developer UI.
- Opening `Map` displays only the fullscreen mapview plus lower-left `X` and `Toggle Realm` controls.
- The mapview opens on the player's current realm and renders the selected diagnostic realm through another world-view instance, with fog disabled and ambient lighting forced to `1`.
- `Toggle Realm` cycles the mapview through generated realms without changing the player's active gameplay realm or position.
- The mapview uses minimap-style markers for relevant entities so developers can inspect starts, player position, quest objects, torches, items, enemies, and spawners.
- The mapview does not accept keyboard gameplay input while open, and closing it restores normal game input.
- The mapview does not draw minimap quest edge indicators or other offscreen navigation indicators.
- In landscape, the default mapview zoom fits the whole active realm on screen.

## Capabilities

### New Capabilities

- `developer-mapview`: Developer-only fullscreen world inspection view launched from Info.

### Modified Capabilities

- `game-layer-architecture`: React continues to own only the launcher/open state while Babylon Lite owns mapview world rendering and mutable world data.
- `world-view-rendering`: The shared world-view renderer gains an explicit no-fog diagnostic mapview mode while preserving the existing game and minimap behavior.

## Impact

- Affects the React UI launcher/window state in `ascii-rpg/src/runtime/ui-layer-react/App.jsx` and related UI styling.
- Affects the bridge between React and Babylon Lite if a narrow open/close mapview command or snapshot is needed.
- Affects Babylon Lite world-view rendering, marker projection, and input gating under `ascii-rpg/src/runtime/game-layer-babylon-lite/`.
- Requires focused Node/source tests for the UI launcher, mapview renderer parameters, marker inclusion/exclusion, input suppression, and no regression to the existing minimap.
- Requires manual browser verification in landscape that the mapview fills the screen and fits the active realm.
