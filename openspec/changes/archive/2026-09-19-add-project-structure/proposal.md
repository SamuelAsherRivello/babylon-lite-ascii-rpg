# Proposal

## Why

The current `ascii-rpg` source tree mixes React UI, Babylon Lite runtime code,
and their communication boundary at one level, which makes ownership and the
expected location for new files unclear. A layer-oriented structure will make
the existing architecture visible in the filesystem and give contributors and
AI agents representative templates to follow.

The test tree should mirror the source tree so that each implementation module
has an obvious corresponding test location.

## What Changes

- Organize runtime code under `ascii-rpg/src/runtime/` with three sibling
  layers: `ui-layer-react/`, `bridge-layer/`, and
  `game-layer-babylon-lite/`.
- Keep React-specific components and `.jsx` templates in
  `ui-layer-react/`.
- Keep Babylon Lite runtime code in `.js` modules, with systems named using
  the `*-system.js` convention, including `input-system.js`,
  `rendering-system.js`, `time-system.js`, and `world-system.js`.
- Organize game characters under
  `game-layer-babylon-lite/characters/`, including a `player/` area.
- Keep bridge communication and state-translation code in the sibling
  `bridge-layer/`.
- Add `Template.jsx` and `Template.js` examples where the layer's technology
  supports them, and add layer guidance telling contributors and AI agents to
  use the closest template as a starting point without modifying the template
  itself for ordinary feature work.
- Use `.json` files for font and palette data rather than treating them as
  React modules; place them under
  `game-layer-babylon-lite/data/` as `font_data.json` and
  `palette_data.json`.
- Restructure `ascii-rpg/test/` to mirror the relevant `src/` paths and layer
  boundaries.
- Preserve the existing React-to-Babylon Lite ownership boundary and runtime
  behavior while relocating files.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `game-layer-architecture`: clarify and make the existing UI, bridge, and
  Babylon Lite ownership boundaries explicit in the source and test layout,
  including the template conventions used for new code.

## Impact

- Affected implementation paths under `ascii-rpg/src/` and tests under
  `ascii-rpg/test/`.
- Imports, Vite entry points, test paths, and any OpenSpec skill checks that
  refer to the current file locations will need updating.
- No new runtime dependency is expected; the existing React, React DOM,
  `react-colorful`, Vite, and `@babylonjs/lite` dependencies remain in use.
- The browser-visible UI/game behavior and the narrow bridge contract should
  remain unchanged.
